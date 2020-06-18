import * as React from "react";
import { RouteComponentProps } from "react-router";

import { Container } from "./_Container";
import { ViewCampaign } from "./View";

interface RouteParams {
  id: string
}

export const ViewPage: React.FC<RouteComponentProps<RouteParams>> = ({ match }) => {
  const id = match.params.id;

  return (
    <Container id={id}>
      {campaign => {
        if(!campaign) {
          return (<div>Not found</div>);
        } else {
          return (
            <ViewCampaign campaign={campaign} />
          );
        }
      }}
    </Container>
  );
};
