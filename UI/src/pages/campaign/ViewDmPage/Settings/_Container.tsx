import React, { useState, useEffect } from "react";

import { CampaignSettings } from "../../../../types";
import { LoadingByState } from "../../../../components/Loading";
import { CampaignStorageService } from "../../CampaignStorageService";
import { TransactionStatus, TransactionState, buildStatus } from "../../../../shared/TransactionStatus";

interface Props {
  service: CampaignStorageService,
  children: (settings: CampaignSettings, saving: TransactionStatus, onSave: onSave) => React.ReactNode
}
type onSave = (settings: CampaignSettings) => void;

export const Container: React.FC<Props> = ({ service, children }) => {
  const [loading, setLoading] = useState<TransactionStatus>(buildStatus(TransactionState.INACTIVE));
  const [saving, setSaving] = useState<TransactionStatus>(buildStatus(TransactionState.INACTIVE));
  const [settings, setSettings] = useState<CampaignSettings>();

  // Run onMount
  useEffect(() => {
    const connected = service.isConnected();
    if(!connected) return;

    const getSettings = async () => {
      setLoading(buildStatus(TransactionState.PENDING));
      try {
        const s = await service.getSettings();
        setSettings(s);
        setLoading(buildStatus(TransactionState.SUCCESS));  
      } catch (err) {
        setLoading(buildStatus(TransactionState.ERRORED, err));  
      }
    };

    getSettings();
  }, [service]);

  const onSave: onSave = settings => {
    const saveSettings = async (settings: CampaignSettings) => {
      setSaving(buildStatus(TransactionState.PENDING));
      try {
        const updated = await service.saveSettings(settings);
        setSettings(updated);
        setSaving(buildStatus(TransactionState.SUCCESS));  
      }
      catch (err) {
        setSaving(buildStatus(TransactionState.ERRORED, err));  
      }
    };

    saveSettings(settings);
  };

  return (
    <LoadingByState status={loading}>
      {!!settings && children(settings, saving, onSave)}
    </LoadingByState>
  );
};
