import * as React from "react";
import { RouteComponentProps } from "react-router";

import { Container } from "./_Container";
import { ViewCampaign } from "./View";
import { Alert } from "react-bootstrap";

interface RouteParams {
  id: string
}

export const ViewPage: React.FC<RouteComponentProps<RouteParams>> = ({ match }) => {
  const id = match.params.id;

  return (
    <div className="container">
      <Container id={id}>
        { (campaign, onLeave) => {
          if(!campaign) {
            return (
              <Alert variant="warning">Campaign not found.</Alert>
            );
          } else {
            return (
              <ViewCampaign campaign={campaign} onLeave={onLeave} />
            );
          }
        }}
      </Container>
    </div>
  );
};
