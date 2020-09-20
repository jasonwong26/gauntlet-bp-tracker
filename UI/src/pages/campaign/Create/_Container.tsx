import React, { useState, useEffect } from "react";

import { TransactionStatus, TransactionState, buildStatus } from "../../../shared/TransactionStatus";
import { Campaign } from "../_types";
import { CampaignStorageService2 } from "../CampaignStorageService2";
import { CampaignListService } from "../List/CampaignListService";
import { LocalStorageService } from "../../../utility";

interface Props {
  children: (
    saving: TransactionStatus,
    onUpdate: (campaign: Campaign) => void,
    onCreate: (campaign: Campaign) => void,
    campaign?: Campaign) => React.ReactNode
}

export const Container: React.FC<Props> = ({ children }) => {
  const [listService, setListService] = useState<CampaignListService>();
  const [service, setService] = useState<CampaignStorageService2>();
  const [connected, setConnected] = useState<boolean>(false);
  const [campaign, setCampaign] = useState<Campaign>();
  const [saving, setSaving] = useState<TransactionStatus>(buildStatus(TransactionState.INACTIVE));

  // Run onMount
  useEffect(() => {
    const local = new LocalStorageService();
    const lsvc = new CampaignListService(local);
    setListService(lsvc);

    const svc = new CampaignStorageService2();
    const buildService = async () => {
      setService(svc);
      await svc.connect();
      setConnected(true);
    }
    buildService();

    // Cleanup method
    return () => {
      svc.disconnect();
      setService(undefined);
    };
  }, []);

  const onUpdate = (campaign: Campaign) => {
    setCampaign(campaign);
  }

  const onCreate = (campaign: Campaign) => {
    createCampaign(campaign);
  }
  const createCampaign = async (campaign: Campaign) => {
    if(!service || !listService || !connected) {
      setSaving(buildStatus(TransactionState.ERRORED, "unable to save."));
      return;
    }

    setSaving(buildStatus(TransactionState.PENDING));
    const saved = await service.createCampaign(campaign);

    setSaving(buildStatus(TransactionState.SUCCESS));
    setCampaign(saved);
    listService.add(saved);
  }

  return (
    <>
      { children(saving, onUpdate, onCreate, campaign) }
    </>
  );
};
