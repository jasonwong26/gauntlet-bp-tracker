import React, { useState, useEffect } from "react";

import { LoadingByState } from "../../../../components/Loading";
import { CampaignStorageService } from "../../CampaignStorageService";
import { TransactionStatus, TransactionState, buildStatus } from "../../../../shared/TransactionStatus";
import { CampaignSettings } from "../../_types";

interface Props {
  service: CampaignStorageService,
  children: (settings: CampaignSettings) => React.ReactNode
}

export const Container: React.FC<Props> = ({ service, children }) => {
  const [loading, setLoading] = useState<TransactionStatus>(buildStatus(TransactionState.INACTIVE));
  const [settings, setSettings] = useState<CampaignSettings>();

  // Run onMount
  useEffect(() => {
    const connected = service.isConnected();
    if(!connected) return;

    setLoading(buildStatus(TransactionState.PENDING));
    service.getSettings(s => {
      setSettings(s);
      setLoading(buildStatus(TransactionState.SUCCESS));
    });
  }, [service]);
  
  return (
    <LoadingByState status={loading}>
      {settings && children(settings)}
    </LoadingByState>
  );
};
