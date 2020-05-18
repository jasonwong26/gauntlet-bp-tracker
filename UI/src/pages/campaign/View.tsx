import * as React from "react";
import { RouteComponentProps } from "react-router";

interface RouteParams {
  id: string
}

interface Params extends RouteComponentProps<RouteParams> {
}

export const ViewCampaign: React.FC<Params> = ({ match }) => (
  <div className="container">
    <h2>View Campaign</h2>
    <p>This is a placeholder.</p>
    <p><strong>ID</strong>: {match.params.id}</p>
  </div>
);
