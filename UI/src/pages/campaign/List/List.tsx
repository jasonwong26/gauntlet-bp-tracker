import React, { useState } from "react";
import { Button, Card, Col, Row } from "react-bootstrap";
import FontAwesome from "react-fontawesome";
import { LinkContainer } from "react-router-bootstrap";

import { CampaignSummary } from "../../../types";

interface Props {
  campaigns: CampaignSummary[]
  onDelete?: (campaign: CampaignSummary) => void
}

export const List: React.FC<Props> = ({ campaigns, onDelete }) => {
  return (
    <>
      <Row>
        <Col>
          <h2>Campaigns</h2>
        </Col>
        <Col sm="auto">
          <LinkContainer exact to="/campaign/create">
            <a href="/campaign/create">
              <Button variant="success"><FontAwesome name="plus" /> Create</Button>
            </a>
          </LinkContainer>
        </Col>
      </Row>
      <hr/>
      <Row>
        {!!campaigns.length && campaigns.map(c => (
          <ListItem key={`campaign-${c.id}`} campaign={c} onDelete={onDelete} />
        ))}
      </Row>
    </>
  );
};

interface ItemProps {
  campaign: CampaignSummary,
  onDelete?: (campaign: CampaignSummary) => void
}

const ListItem: React.FC<ItemProps> = ({ campaign, onDelete }) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const toggleIsDeleting = () => {
    setIsDeleting(d => !d);
  };
  const handleDelete = () => {
    if(onDelete) onDelete(campaign);
  };

  const url = `/campaign/${campaign.id}`;

  return (
    <Col sm={4}>
      <Card>
        <Card.Title className="mb-0 text-right">
          <Button size="sm" variant="link" title="Leave Campaign" onClick={toggleIsDeleting}><FontAwesome name="times" /></Button>
        </Card.Title>
        {!isDeleting && (
          <LinkContainer exact to={url}>
          <a href={url}>
            <Card.Body className="pt-0">
              <h4 className="mb-0">{campaign.title}</h4>
              <small>{campaign.author}</small>
            </Card.Body>
            </a>
        </LinkContainer>  
        )}
        {!!isDeleting && (
          <Card.Body className="pt-0">
            <p>Are you sure you want to leave this campaign?</p>
            <Button size="sm" onClick={toggleIsDeleting}>No</Button>
            <Button size="sm" className="ml-3" onClick={handleDelete}>Yes</Button>
          </Card.Body>
        )}
      </Card>
    </Col>
  );
};
