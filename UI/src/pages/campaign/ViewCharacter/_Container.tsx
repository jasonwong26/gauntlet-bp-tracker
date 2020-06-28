import React, { useState, useEffect } from "react";

import { LoadingByState } from "../../../components/Loading";
import { Notification } from "../../../components/Toast";
import { AppState, SetEncounter, OnPurchase, OnRemove, Character } from "../../characters/View/_types";
import { CampaignStorageService } from "../CampaignStorageService";
import { AppService, CharacterAppService } from "../../characters/View/AppService";
import { TransactionStatus, TransactionState, buildStatus } from "../../../shared/TransactionStatus";
import { CampaignSettings } from "../_types";

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
  const [service, setService] = useState<CampaignStorageService>();
  const [connected, setConnected] = useState<boolean>(false);
  const [campaign, setCampaign] = useState<CampaignSettings>();
  const [character, setCharacter] = useState<Character>();
  const [appService, setAppService] = useState<AppService>();
  const [appState, setAppState] = useState<AppState>();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [, setSaveState] = useState<TransactionStatus>(buildStatus(TransactionState.INACTIVE));

  // Run onMount
  useEffect(() => {
    setLoading(buildStatus(TransactionState.PENDING));

    const svc = new CampaignStorageService(campaignId);
    svc.connect(() => setConnected(true));
    setService(svc);

    svc.subscribeToAlerts(notification => {
      setNotifications(ns => {
        return [...ns, notification];
      });
    });

    // Cleanup method
    return () => {
      svc.disconnect();
      setConnected(false);
      setService(undefined);
    };
  }, [campaignId, characterId]);

  useEffect(() => {
    if(!service || !connected) return;

    service.getSettings(settings => {
      setCampaign(settings);
    });

    service.getCharacter(characterId, char => {
      setCharacter(char);
    });
  }, [campaignId, characterId, service, connected]);

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
    setSaveState(buildStatus(TransactionState.PENDING));
    service?.addItem(characterId, purchased, () => {
      setSaveState(buildStatus(TransactionState.SUCCESS));
    });
  };
  const onRemove: OnRemove = item => {
    appService!.onRemove(item);
    const newState = appService!.getState();
    setAppState(newState);    
    setSaveState(buildStatus(TransactionState.PENDING));
    service?.removeItem(characterId, item, () => {
      setSaveState(buildStatus(TransactionState.SUCCESS));
    });
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
      { children(notifications, onToastClose, appState, setEncounter, onPurchase, onRemove) }
    </LoadingByState>
  );
};
