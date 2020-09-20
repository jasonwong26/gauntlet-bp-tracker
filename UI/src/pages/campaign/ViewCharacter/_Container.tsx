import React, { useState, useEffect } from "react";

import { LoadingByState } from "../../../components/Loading";
import { Notification } from "../../../components/Toast";
import { AppState, SetEncounter, OnPurchase, OnRemove, Character } from "../../characters/View/_types";
import { LocalStorageService } from "../../../utility";
import { CampaignListService } from "../List/CampaignListService";
import { CampaignStorageService2 } from "../CampaignStorageService2";
import { AppService, CharacterAppService } from "../../characters/View/AppService";
import { TransactionStatus, TransactionState, buildStatus } from "../../../shared/TransactionStatus";
import { CampaignSettings } from "../_types";
import { Alert } from "react-bootstrap";

interface Props {
  campaignId: string
  characterId: string
  children: (
    notifications: Notification[],
    onToastClose: (notification: Notification) => void,
    app?: AppState, 
    setEncounter?: SetEncounter, 
    onPurchase?: OnPurchase, 
    onRemove?: OnRemove) 
    => React.ReactNode
}

export const Container: React.FC<Props> = ({ campaignId, characterId, children }) => {
  const [loading, setLoading] = useState<TransactionStatus>(buildStatus(TransactionState.INACTIVE));
  const [service, setService] = useState<CampaignStorageService2>();
  const [listService, setListService] = useState<CampaignListService>();
  const [isValidCampaign, setIsValidCampaign] = useState<boolean>();
  const [campaign, setCampaign] = useState<CampaignSettings>();
  const [character, setCharacter] = useState<Character>();
  const [appService, setAppService] = useState<AppService>();
  const [appState, setAppState] = useState<AppState>();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [, setSaveState] = useState<TransactionStatus>(buildStatus(TransactionState.INACTIVE));

  // Run onMount
  useEffect(() => {
    setLoading(buildStatus(TransactionState.PENDING));

    const local = new LocalStorageService();
    const lsvc = new CampaignListService(local);
    setListService(lsvc);
    
    const svc = new CampaignStorageService2();
    setService(svc);

    const validateCampaign = async () => {
      const isValid = await lsvc.exists(campaignId);
      setIsValidCampaign(isValid);

      if(!isValid) {
        setLoading(buildStatus(TransactionState.SUCCESS));
      }  
    }
    validateCampaign();

    // Cleanup method
    return () => {
      svc.disconnect();
      setService(undefined);
      setListService(undefined);
    };
  }, [campaignId]);

  useEffect(() => {
    if(!service || !listService || !isValidCampaign) return;

    const connect = async () => {
      try {
        await service.connect(campaignId);
        service.subscribeToAlerts(notification => {
          setNotifications(ns => {
            return [...ns, notification];
          });
        });

        const settings = await service.getSettings(campaignId);
        setCampaign(settings);  
        const char = await service.getCharacter(characterId);
        if(!char) {
          setLoading(buildStatus(TransactionState.SUCCESS));
        }
        setCharacter(char);
      } catch(err){
        setLoading(buildStatus(TransactionState.ERRORED, err));
      }
    }
    connect();
  }, [campaignId, characterId, service, listService, isValidCampaign]);

  useEffect(() => {
    if(!campaign || !character) return;

    const app = new CharacterAppService(campaign, character);
    setAppService(app);
    const state = app.getState();
    setAppState(state);
    setLoading(buildStatus(TransactionState.SUCCESS));
  }, [campaign, character]);

  const setEncounter: SetEncounter = encounter => {    
    appService!.setEncounter(encounter);
    const newState = appService!.getState();
    setAppState(newState);
  };
  const onPurchase: OnPurchase = item => {
    const purchased = appService!.onPurchase(item);
    const newState = appService!.getState();
    setAppState(newState);

    const saveTransaction = async () => {
      try {
        setSaveState(buildStatus(TransactionState.PENDING));
        await service?.addItem(characterId, purchased);
        setSaveState(buildStatus(TransactionState.SUCCESS));  
      } catch (err) {
        setSaveState(buildStatus(TransactionState.ERRORED, err));  
      }
    }
    saveTransaction();
  };
  const onRemove: OnRemove = item => {
    appService!.onRemove(item);
    const newState = appService!.getState();
    setAppState(newState);    

    const saveTransaction = async () => {
      try {
        setSaveState(buildStatus(TransactionState.PENDING));
        await service?.removeItem(characterId, item);
        setSaveState(buildStatus(TransactionState.SUCCESS));  
      } catch (err) {
        setSaveState(buildStatus(TransactionState.ERRORED, err));  
      }
    }
    saveTransaction();
  };
  
  const onToastClose = (notification: Notification) => {
    setNotifications(ns => {
      const index = ns.findIndex(n => n.key === notification.key);
      if(index === -1) return ns;

      ns.splice(index, 1);
      return [...ns];
    });
  };
  return (
    <LoadingByState status={loading}>
      {!isValidCampaign && (
        <div className="container">
          <Alert variant="warning">Campaign not found...</Alert>
        </div>
      )}
      {!!isValidCampaign && !character && (
        <div className="container">
          <Alert variant="warning">Character not found...</Alert>
        </div>
      )}
      { !!isValidCampaign && !!character && children(notifications, onToastClose, appState, setEncounter, onPurchase, onRemove) }
    </LoadingByState>
  );
};
