import React from "react";
import { Alert, Card } from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";

import { CampaignSummary } from "../_types";

interface Props {
  campaigns: CampaignSummary[]
  onDelete?: (character: CampaignSummary) => void
}

export const List: React.FC<Props> = ({ campaigns }) => {
  return (
    <>
    <div className="container">
      <h2>Campaigns</h2>
      <hr/>
      <div className="row">
        {!campaigns.length && (
         <Alert variant="warning">No campaigns found...</Alert>
        )}
        {!!campaigns.length && campaigns.map(c => (
          <ListItem key={`campaign-${c.id}`} campaign={c} />
        ))}
      </div>
    </div>
    </>
  );
};

interface ItemProps {
  campaign: CampaignSummary
}

const ListItem: React.FC<ItemProps> = ({ campaign }) => {
  const characterUrl = `/campaign/${campaign.id}`;
  
  return (
    <div className="col-4">
      <Card>
        <LinkContainer exact to={characterUrl}>
          <a href={characterUrl}>
            <Card.Body>
              <h2 className="mb-0">{campaign.title}</h2>
              <small>{campaign.author}</small>
            </Card.Body>
            </a>
        </LinkContainer>  
      </Card>
    </div>
  );
};
