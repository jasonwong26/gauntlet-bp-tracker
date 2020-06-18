import React, { useState, useEffect } from "react";

import { LoadingByState } from "../../../components/Loading";
import { Campaign } from "../_types";
import { CampaignListService } from "../List/CampaignListService";
import { CampaignStorageService } from "../CampaignStorageService";
import { LocalStorageService } from "../../../utility";
import { TransactionStatus, TransactionState, buildStatus } from "../../../shared/TransactionStatus";

interface Props {
  id: string
  children: (campaignId?: string) 
    => React.ReactNode
}


export const Container: React.FC<Props> = ({ id, children }) => {
  const [loading, setLoading] = useState<TransactionStatus>(buildStatus(TransactionState.INACTIVE));
  const [listService, setListService] = useState<CampaignListService>();
  const [service, setService] = useState<CampaignStorageService>();
  const [connected, setConnected] = useState<boolean>(false);
  const [campaign, setCampaign] = useState<Campaign>();

  // Run onMount
  useEffect(() => {
    const local = new LocalStorageService();
    const lsvc = new CampaignListService(local);
    setListService(lsvc);

    setLoading(buildStatus(TransactionState.PENDING));
    const svc = new CampaignStorageService(id);
    svc.connect(() => setConnected(true));
    setService(svc);

    // Cleanup method
    return () => {
      svc.disconnect();
      setService(undefined);
    };
  }, [id]);

  useEffect(() => {
    if(!service || !connected) return;
  
    service.getCampaign(c => {
      setCampaign(c);
      setLoading(buildStatus(TransactionState.SUCCESS));
    });
  }, [id, service, connected]);
  useEffect(() => {
    if(!listService || !campaign) return;

    const addToList = async () => {
      const list = await listService.list();
      const index = list.findIndex(c => c.id === campaign.id);
      if(index === -1) {
        await listService.add(campaign);  
      }
    }

    addToList();
  }, [listService, campaign]);

  const campaignId = campaign?.id;
  return (
    <LoadingByState status={loading}>
      { children(campaignId) }
    </LoadingByState>
  );
};
