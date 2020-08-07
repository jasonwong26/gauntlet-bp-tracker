import React, { useState, useEffect } from "react";

import { LoadingByState } from "../../../../components/Loading";
import { CampaignStorageService } from "../../CampaignStorageService";
import { TransactionStatus, TransactionState, buildStatus } from "../../../../shared/TransactionStatus";
import { AlertRequest, PurchaseAlert } from "../../_types";

interface Props {
  service: CampaignStorageService,
  children: (
    notifications: PurchaseAlert[],
    refreshing: TransactionStatus,
    fetching: TransactionStatus,
    lastPageSize: number,
    onRefresh?: (pageSize: number) => void,
    onFetch?: (pageSize: number) => void) 
    => React.ReactNode
}

export const Container: React.FC<Props> = ({ service, children }) => {
  const [loading, setLoading] = useState<TransactionStatus>(buildStatus(TransactionState.INACTIVE));
  const [notifications, setNotifications] = useState<PurchaseAlert[]>([]);
  const [refreshing, setRefreshing] = useState<TransactionStatus>(buildStatus(TransactionState.INACTIVE));
  const [fetching, setFetching] = useState<TransactionStatus>(buildStatus(TransactionState.INACTIVE));
  const [lastPageSize, setLastPageSize] = useState<number>(0);

  // Run onMount
  useEffect(() => {
    const connected = service.isConnected();
    if(!connected) return;

    var request: AlertRequest = {
      minDate: 0,
      maxDate: new Date().getTime()
    }
    setLoading(buildStatus(TransactionState.PENDING));
    service.getNotifications(request, alerts => {
      setNotifications(alerts);
      setLastPageSize(alerts.length);
      setLoading(buildStatus(TransactionState.SUCCESS));
    });
  }, [service]);
  
  const onRefresh = (pageSize: number) => {
    if(!service) return;

    const request: AlertRequest = {
      minDate: 0,
      maxDate: new Date().getTime(),
      pageSize: pageSize
    }
    setRefreshing(buildStatus(TransactionState.PENDING));
    service.getNotifications(request, alerts => {
      setNotifications(alerts);
      setLastPageSize(alerts.length);
      setRefreshing(buildStatus(TransactionState.SUCCESS));
    });
  };

  const onFetch = (pageSize: number) => {
    if(!service) return;

    const request: AlertRequest = {
      minDate: 0,
      maxDate: new Date().getTime(),
      pageSize: pageSize
    }
    if(!!notifications.length) {
      const lastAlert = notifications[notifications.length - 1];
      request.maxDate = lastAlert.item.purchaseDate - 1;
    }

    setFetching(buildStatus(TransactionState.PENDING));
    service.getNotifications(request, alerts => {
      setNotifications(ns => {
        return [...ns, ...alerts]
      });
      setLastPageSize(alerts.length);
      setFetching(buildStatus(TransactionState.SUCCESS));
    });
  };

  return (
    <LoadingByState status={loading}>
      { children(notifications, refreshing, fetching, lastPageSize, onRefresh, onFetch) }
    </LoadingByState>
  );
};
