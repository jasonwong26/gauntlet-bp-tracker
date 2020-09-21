import React, { useState, useEffect } from "react";

import { Campaign } from "../../../types";
import { LoadingByState } from "../../../components/Loading";
import { TransactionStatus, TransactionState, buildStatus } from "../../../shared/TransactionStatus";
import { CampaignStorageService } from "../CampaignStorageService2";
import { CampaignListService } from "../List/CampaignListService";
import { LocalStorageService } from "../../../utility";
import { Redirect } from "react-router";

interface Props {
  id: string
  children: (
    campaign: Campaign,
    onLeave: () => void
  ) => React.ReactNode
}

export const Container: React.FC<Props> = ({ id, children }) => {
  const [loading, setLoading] = useState<TransactionStatus>(buildStatus(TransactionState.INACTIVE));
  const [listService, setListService] = useState<CampaignListService>();
  const [service, setService] = useState<CampaignStorageService>();
  const [campaign, setCampaign] = useState<Campaign>();
  const [redirect, setRedirect] = useState<boolean>(false);

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
    if(!service || !listService) return;

    const connect = async () => {
      try {
        const campaignExists = await listService.exists(id);
        if(campaignExists) {  
          await service.connect(id);
          const c = await service.getCampaign(id);
          setCampaign(c);  
        } 
  
        setLoading(buildStatus(TransactionState.SUCCESS));
      } catch(err){
        setLoading(buildStatus(TransactionState.ERRORED, err));
      }
    }
    connect();
  }, [id, service, listService]);

  const onLeave = () => {
    if(!listService || !campaign) return;
    listService.remove(campaign.id);
    setRedirect(true);
  }

  return (
    <LoadingByState status={loading}>
      { !redirect && children(campaign!, onLeave) }
      { !!redirect && (
        <Redirect to="/campaign" />
      ) }
    </LoadingByState>
  );
};
