import * as React from "react";
import { RouteComponentProps } from "react-router";
import { Alert } from "react-bootstrap";

import { ToastContainer } from "../../../components/Toast";
import { Container } from "./_Container";
import { ViewCharacter } from "./View";

interface RouteParams {
  campaignId: string
  characterId: string
}

export const ViewCharacterPage: React.FC<RouteComponentProps<RouteParams>> = ({ match }) => {
  const { campaignId, characterId } = match.params;

  return (
    <Container campaignId={campaignId} characterId={characterId}>
      {(notifications, onToastClose, character, saving, app, updateProfile, setEncounter, onPurchase, onRemove) => {
        if(!app) {
          return (<Alert>Character not found</Alert>);
        } else {
          return (
            <ToastContainer notifications={notifications} onClose={onToastClose}>
              <ViewCharacter character={character} saving={saving} app={app} updateProfile={updateProfile} setEncounter={setEncounter} onPurchase={onPurchase} onRemove={onRemove} />
            </ToastContainer>
          );
        }
      }}
    </Container>
  );
};
