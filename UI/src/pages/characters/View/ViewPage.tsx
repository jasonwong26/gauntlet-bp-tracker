import * as React from "react";
import { RouteComponentProps } from "react-router";

import { Container } from "./_Container";
import { ViewCharacter } from "./View";

interface RouteParams {
  id: string
}

export const ViewPage: React.FC<RouteComponentProps<RouteParams>> = ({ match }) => {
  const id = match.params.id;

  return (
    <Container id={id}>
      {( saving, app, setEncounter, onPurchase, onRemove) => {
        if(!app) {
          return (<div>Not found</div>);
        } else {
          return (
            <ViewCharacter saving={saving} app={app} setEncounter={setEncounter} onPurchase={onPurchase} onRemove={onRemove} />
        );
        }
      }}
    </Container>
  );
};
