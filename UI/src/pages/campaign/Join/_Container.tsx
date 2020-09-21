import React, { useState, useEffect } from "react";

import { Campaign } from "../../../types";
import { LoadingByState } from "../../../components/Loading";
import { CampaignListService } from "../List/CampaignListService";
import { CampaignStorageService } from "../CampaignStorageService2";
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
  const [campaign, setCampaign] = useState<Campaign>();

  // Run onMount
  useEffect(() => {
    setLoading(buildStatus(TransactionState.PENDING));

    const local = new LocalStorageService();
    const lsvc = new CampaignListService(local);
    setListService(lsvc);

    const svc = new CampaignStorageService();
    setService(svc);

    // Cleanup method
    return () => {
      svc.disconnect();
      setService(undefined);
      setListService(undefined);
    };
  }, [id]);

  useEffect(() => {
    if(!service) return;
  
    const connect = async () => {
      try {
        await service.connect(id);
        const c = await service.getCampaign(id);
        setCampaign(c);  
  
        setLoading(buildStatus(TransactionState.SUCCESS));
      } catch(err){
        setLoading(buildStatus(TransactionState.ERRORED, err));
      }
    }
    connect();
  }, [id, service]);
  useEffect(() => {
    if(!listService || !campaign) return;

    const addToList = async () => {
      const list = await listService.list();
      const index = list.findIndex(c => c.id === campaign.id);
      if(index === -1) {
        await listService.add(campaign);  
      }
    };

    addToList();
  }, [listService, campaign]);

  const campaignId = campaign?.id;
  return (
    <LoadingByState status={loading}>
      { children(campaignId) }
    </LoadingByState>
  );
};
