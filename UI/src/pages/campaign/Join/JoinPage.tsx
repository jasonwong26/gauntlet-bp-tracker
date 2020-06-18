import * as React from "react";
import { Redirect, RouteComponentProps } from "react-router";
import { Alert } from "react-bootstrap";

import { Container } from "./_Container";

interface RouteParams {
  id: string
}

export const JoinPage: React.FC<RouteComponentProps<RouteParams>> = ({ match }) => {
  const id = match.params.id;

  return (
    <div className="container">
      <Container id={id}>
        {campaignId => {
          if(!campaignId) {
            return (<Alert variant="danger">Campaign not found...</Alert>);
          } else {
            return (
              <Redirect to={`/campaign/${campaignId}`} />
            );
          }
        }}
      </Container>
    </div>
  );
};
