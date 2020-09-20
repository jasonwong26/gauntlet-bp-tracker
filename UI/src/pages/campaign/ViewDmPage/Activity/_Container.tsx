import React, { useState, useEffect } from "react";

import { LoadingByState } from "../../../../components/Loading";
import { CampaignStorageService2 } from "../../CampaignStorageService2";
import { TransactionStatus, TransactionState, buildStatus } from "../../../../shared/TransactionStatus";
import { AlertRequest, PurchaseAlert } from "../../_types";

interface Props {
  service: CampaignStorageService2,
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

    const request: AlertRequest = {
      minDate: 0,
      maxDate: new Date().getTime()
    };

    const loadNotifications = async (request: AlertRequest) => {
      setLoading(buildStatus(TransactionState.PENDING));
      const alerts = await service.getNotifications(request);
      setNotifications(alerts);
      setLastPageSize(alerts.length);
      setLoading(buildStatus(TransactionState.SUCCESS));
    }

    loadNotifications(request);
  }, [service, setLoading, setNotifications, setLastPageSize]);


  const onRefresh = (pageSize: number) => {
    if(!service) return;

    const request: AlertRequest = {
      minDate: 0,
      maxDate: new Date().getTime(),
      pageSize
    };
    const refreshNotifications = async (request: AlertRequest) => {
      setRefreshing(buildStatus(TransactionState.PENDING));
      const alerts = await service.getNotifications(request);
      setNotifications(alerts);
      setLastPageSize(alerts.length);
      setRefreshing(buildStatus(TransactionState.SUCCESS));
    }

    refreshNotifications(request);
  };

  const onFetch = (pageSize: number) => {
    if(!service) return;

    const request: AlertRequest = {
      minDate: 0,
      maxDate: new Date().getTime(),
      pageSize
    };
    if(!!notifications.length) {
      const lastAlert = notifications[notifications.length - 1];
      request.maxDate = lastAlert.item.purchaseDate - 1;
    }
    const fetchNotifications = async (request: AlertRequest) => {
      setFetching(buildStatus(TransactionState.PENDING));
      const alerts = await service.getNotifications(request);
      setNotifications(ns => {
        return [...ns, ...alerts];
      });
      setLastPageSize(alerts.length);
      setFetching(buildStatus(TransactionState.SUCCESS));
    }

    fetchNotifications(request);
  };

  return (
    <LoadingByState status={loading}>
      { children(notifications, refreshing, fetching, lastPageSize, onRefresh, onFetch) }
    </LoadingByState>
  );
};
