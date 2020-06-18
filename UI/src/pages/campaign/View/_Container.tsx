import React, { useState, useEffect } from "react";

import { LoadingByState } from "../../../components/Loading";
import { TransactionStatus, TransactionState, buildStatus } from "../../../shared/TransactionStatus";
import { Campaign } from "../_types";
import { CampaignStorageService } from "../CampaignStorageService";

interface Props {
  id: string
  children: (campaign?: Campaign) 
    => React.ReactNode
}

export const Container: React.FC<Props> = ({ id, children }) => {
  const [loading, setLoading] = useState<TransactionStatus>(buildStatus(TransactionState.INACTIVE));
  const [service, setService] = useState<CampaignStorageService>();
  const [connected, setConnected] = useState<boolean>(false);
  const [campaign, setCampaign] = useState<Campaign>();

  // Run onMount
  useEffect(() => {
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

  return (
    <LoadingByState status={loading}>
      { children(campaign) }
    </LoadingByState>
  );
};
