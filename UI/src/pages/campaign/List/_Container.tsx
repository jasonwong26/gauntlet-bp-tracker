import React, { useState, useEffect } from "react";

import {LocalStorageService } from "../../../utility";
import { CampaignListService } from "./CampaignListService";
import { Campaign, CampaignSummary } from "../_types";

interface Props {
  children: (campaigns: CampaignSummary[], onDelete: (campaign: Campaign) => void) => React.ReactNode
}

export const Container: React.FC<Props> = ({ children }) => {
  const [service, setService] = useState<CampaignListService>();
  const [campaigns, setCampaigns] = useState<CampaignSummary[]>([]);

  // Run onMount
  useEffect(() => {
    const local = new LocalStorageService();
    const svc = new CampaignListService(local);
    setService(svc);

    // Cleanup method
    return () => {
      setService(undefined);
    };
  }, []);

  useEffect(() => {
    if(!service) return;

    const fetch = async () => {
      const list = await service.list();
      setCampaigns(list);
    };
    fetch();
  }, [service]);

  const onDelete = async (campaign: CampaignSummary) => {
    await service!.remove(campaign.id);
    const list = await service!.list();
    setCampaigns(list);
  };

  return (
    <React.Fragment>
      { children(campaigns, onDelete) }
    </React.Fragment>
  );
};
