import React, { useState, useEffect } from "react";
import { Alert } from "react-bootstrap";

import { CampaignSummary } from "../../../types";
import { LoadingByState } from "../../../components/Loading";
import { Notification } from "../../../components/Toast";
import { buildStatus, TransactionState, TransactionStatus } from "../../../shared/TransactionStatus";
import { CampaignStorageService } from "../CampaignStorageService";
import { LocalStorageService } from "../../../utility";
import { CampaignListService } from "../List/CampaignListService";

interface Props {
  campaignId: string
  children: (
    service: CampaignStorageService,
    listService: CampaignListService,
    toasts: Notification[],
    onToastClose: (notification: Notification) => void) 
    => React.ReactNode
}

export const Container: React.FC<Props> = ({ campaignId, children }) => {
  const [loading, setLoading] = useState<TransactionStatus>(buildStatus(TransactionState.INACTIVE));
  const [listService, setListService] = useState<CampaignListService>();
  const [service, setService] = useState<CampaignStorageService>();
  const [campaign, setCampaign] = useState<CampaignSummary>();
  const [toasts, setToasts] = useState<Notification[]>([]);

  // Run onMount
  useEffect(() => {
    const local = new LocalStorageService();
    const lsvc = new CampaignListService(local);
    const svc = new CampaignStorageService();

    setLoading(buildStatus(TransactionState.PENDING));
    const connect = async () => {
      try {
        setService(svc);
        setListService(lsvc);

        const campaignSummary = await lsvc.get(campaignId);
        if(campaignSummary) {
          setCampaign(campaignSummary);

          await svc.connect(campaignId);  
          svc.subscribeToAlerts(notification => {
            setToasts(ts => {
              return [...ts, notification];
            });
          });
        }
  
        setLoading(buildStatus(TransactionState.SUCCESS));  
      } catch(error) {
        setLoading(buildStatus(TransactionState.ERRORED, error));
      }
    };

    connect();

    // Cleanup method
    return () => {
      svc?.disconnect();
      setService(undefined);
      setListService(undefined);
    };
  }, [campaignId]);
  
  const onToastClose = (notification: Notification) => {
    setToasts(ts => {
      const index = ts.findIndex(t => t.key === notification.key);
      if(index === -1) return ts;

      ts.splice(index, 1);
      return [...ts];
    });
  };

  return (
      <LoadingByState status={loading}>
        {!campaign && (
          <Alert variant="warning">Campaign not found...</Alert>
        )}
        {!!campaign && !!service && !!listService && children(service, listService, toasts, onToastClose)}
      </LoadingByState>
  );
};
