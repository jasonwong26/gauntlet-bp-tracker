import React, { useState, useEffect } from "react";
import { Alert } from "react-bootstrap";

import { TransactionStatus, TransactionState, buildStatus } from "../../../shared/TransactionStatus";
import { LoadingByState } from "../../../components/Loading";
import { Notification } from "../../../components/Toast";
import { LocalStorageService } from "../../../utility";
import { CampaignListService } from "../List/CampaignListService";
import { CampaignStorageService } from "../CampaignStorageService";
import { AppService, CharacterAppService } from "./Activity/AppService";
import { CampaignSettings, Character, CharacterSummary, Encounter, PurchasedItem, PurchaseItem } from "../../../types";
import { AppState } from "./Activity/_types";

interface Props {
  campaignId: string
  characterId: string
  children: (
    notifications: Notification[],
    onToastClose: (notification: Notification) => void,
    character: CharacterSummary,
    saving: TransactionStatus,
    app?: AppState, 
    updateProfile?: (character: CharacterSummary) => void,
    setEncounter?: (encounter: Encounter) => void, 
    onPurchase?: (item: PurchaseItem) => void, 
    onRemove?: (item: PurchasedItem) => void
  ) => React.ReactNode
}

export const Container: React.FC<Props> = ({ campaignId, characterId, children }) => {
  const [loading, setLoading] = useState<TransactionStatus>(buildStatus(TransactionState.INACTIVE));
  const [service, setService] = useState<CampaignStorageService>();
  const [listService, setListService] = useState<CampaignListService>();
  const [isValidCampaign, setIsValidCampaign] = useState<boolean>();
  const [campaign, setCampaign] = useState<CampaignSettings>();
  const [character, setCharacter] = useState<Character>();
  const [appService, setAppService] = useState<AppService>();
  const [appState, setAppState] = useState<AppState>();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [saving, setSaveState] = useState<TransactionStatus>(buildStatus(TransactionState.INACTIVE));

  // Run onMount
  useEffect(() => {
    setLoading(buildStatus(TransactionState.PENDING));

    const local = new LocalStorageService();
    const lsvc = new CampaignListService(local);
    setListService(lsvc);
    
    const svc = new CampaignStorageService();
    setService(svc);

    const validateCampaign = async () => {
      const isValid = await lsvc.exists(campaignId);
      setIsValidCampaign(isValid);

      if(!isValid) {
        setLoading(buildStatus(TransactionState.SUCCESS));
      }  
    };
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
    };
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

  const updateProfile = (profile: CharacterSummary) => {
    const saveTransaction = async () => {
      try {
        const updated = {...character!, ...profile}; 
        setCharacter(updated);
        setSaveState(buildStatus(TransactionState.PENDING));
        await service?.saveCharacter(profile);
        setSaveState(buildStatus(TransactionState.SUCCESS));  
      } catch (err) {
        setSaveState(buildStatus(TransactionState.ERRORED, err));  
      }
    };
    saveTransaction();
  };
  const setEncounter = (encounter: Encounter) => {    
    appService!.setEncounter(encounter);
    const newState = appService!.getState();
    setAppState(newState);
  };
  const onPurchase = (item: PurchaseItem) => {
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
    };
    saveTransaction();
  };
  const onRemove = (item: PurchasedItem) => {
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
    };
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
      { !!isValidCampaign && !!character && children(notifications, onToastClose, character, saving, appState, updateProfile, setEncounter, onPurchase, onRemove) }
    </LoadingByState>
  );
};
