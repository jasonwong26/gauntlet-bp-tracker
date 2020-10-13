import React, { useState, useEffect } from "react";
import { Redirect } from "react-router";

import { Campaign, CharacterSummary } from "../../../../types";
import { LoadingByState } from "../../../../components/Loading";
import { CampaignListService } from "../../List/CampaignListService";
import { CampaignStorageService } from "../../CampaignStorageService";
import { TransactionStatus, TransactionState, buildStatus } from "../../../../shared/TransactionStatus";

interface Props {
  service: CampaignStorageService,
  listService: CampaignListService,
  children: (
    campaign: Campaign, 
    saving: TransactionStatus, 
    onSave: (campaign: Campaign) => void, 
    onDelete: (campaign: Campaign) => void, 
    onCharacterSave: (character: CharacterSummary) => void, 
    onCharacterDelete: (character: CharacterSummary) => void
  ) => React.ReactNode
}

export const Container: React.FC<Props> = ({ service, listService, children }) => {
  const [loading, setLoading] = useState<TransactionStatus>(buildStatus(TransactionState.INACTIVE));
  const [saving, setSaving] = useState<TransactionStatus>(buildStatus(TransactionState.INACTIVE));
  const [campaign, setCampaign] = useState<Campaign>();
  const [redirect, setRedirect] = useState<boolean>(false);

  // Run onMount
  useEffect(() => {
    const connected = service.isConnected();
    if(!connected) return;

    setLoading(buildStatus(TransactionState.PENDING));
    const getCampaign = async () => {
      try {
        const c = await service.getCampaign();
        setCampaign(c);
        setLoading(buildStatus(TransactionState.SUCCESS));  
      } catch (err) {
        setLoading(buildStatus(TransactionState.ERRORED, err));  
      }
    };

    getCampaign();
  }, [service]);

  const onSave = (campaign: Campaign) => {
    setSaving(buildStatus(TransactionState.PENDING));

    const updateCampaign = async (campaign: Campaign) => {
      try {
        const updated = await service.updateCampaign(campaign);
        setCampaign(updated);
        setSaving(buildStatus(TransactionState.SUCCESS));  
      } catch (err) {
        setSaving(buildStatus(TransactionState.ERRORED, err));  
      }
    };

    updateCampaign(campaign);
  };

  const onDelete = (campaign: Campaign) => {
    setSaving(buildStatus(TransactionState.PENDING));

    const deleteCampaign = async (campaign: Campaign) => {
      try {
        await service.deleteCampaign(campaign);
        setSaving(buildStatus(TransactionState.SUCCESS));
        listService?.remove(campaign.id);
        setRedirect(true);  
      } catch (err) {
        setSaving(buildStatus(TransactionState.ERRORED, err));
      }
    };

    deleteCampaign(campaign);
  };

  const onCharacterSave = (character: CharacterSummary) => {
    setSaving(buildStatus(TransactionState.PENDING));
    const saveCharacter = async (character: CharacterSummary) => {
      try {
        await service.saveCharacter(character);
        const updatedCampaign = await service.getCampaign();
        setCampaign(updatedCampaign);
        setSaving(buildStatus(TransactionState.SUCCESS));  
      }
      catch (err) {
        setSaving(buildStatus(TransactionState.ERRORED, err));
      }
    };

    saveCharacter(character);
  };
  const onCharacterDelete = (character: CharacterSummary) => {
    setSaving(buildStatus(TransactionState.PENDING));

    const deleteCharacter = async (character: CharacterSummary) => {
      try {
        await service.deleteCharacter(character);
        const updatedCampaign = await service.getCampaign();
        setCampaign(updatedCampaign);
        setSaving(buildStatus(TransactionState.SUCCESS));  
      }
      catch (err) {
        setSaving(buildStatus(TransactionState.ERRORED, err));
      }
    };

    deleteCharacter(character);
  };

  return (
    <LoadingByState status={loading}>
      {children(campaign!, saving, onSave, onDelete, onCharacterSave, onCharacterDelete)}
      {redirect && (
        <Redirect to="/campaign/" />
      )}
    </LoadingByState>
  );
};
