import React, { useState, useEffect } from "react";

import { Loading } from "../../../components/Loading";
import { Notification } from "../../../components/Toast";
import { CampaignStorageService } from "../CampaignStorageService";

interface Props {
  campaignId: string
  children: (
    service: CampaignStorageService,
    toasts: Notification[],
    onToastClose: (notification: Notification) => void) 
    => React.ReactNode
}

export const Container: React.FC<Props> = ({ campaignId, children }) => {
  const [service, setService] = useState<CampaignStorageService>();
  const [connected, setConnected] = useState<boolean>(false);
  const [toasts, setToasts] = useState<Notification[]>([]);

  // Run onMount
  useEffect(() => {
    const svc = new CampaignStorageService(campaignId);
    svc.connect(() => setConnected(true));
    setService(svc);

    svc.subscribeToAlerts(notification => {
      setToasts(ts => {
        return [...ts, notification];
      });
    });

    // Cleanup method
    return () => {
      svc.disconnect();
      setConnected(false);
      setService(undefined);
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
      <>
        {!connected && (
          <Loading />
        )}
        {!!service && connected && children(service, toasts, onToastClose)}
      </>
  );
};
