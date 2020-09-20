import React from "react";
import { Button, Card, Col, Row } from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";

import { Campaign } from "../_types";
import { CharacterSummary } from "../../characters/_types";

interface Props {
  campaign: Campaign,
  onLeave: () => void
}

export const ViewCampaign: React.FC<Props> = ({ campaign, onLeave }) => {
  const { characters } = campaign;
  return (
  <>
    <Row>
      <Col>
        <h2>{campaign.title}</h2>
        <small>{campaign.author}</small>
        <p>{campaign.description}</p>
      </Col>
      <Col sm="auto">
        <Button variant="danger" onClick={onLeave}>Leave Campaign</Button>
      </Col>
    </Row>
    <hr/>
    <Row>
      <DmLink campaign={campaign} />
      {characters.length && characters.map(c => (
        <ListItem key={`character-${c.id}`} campaign={campaign} character={c} />
      ))}
    </Row>
  </>
  );
};

interface DmLinkProps {
  campaign: Campaign
}

const DmLink: React.FC<DmLinkProps> = ({ campaign }) => {
  const url = `/campaign/${campaign.id}/dm-controls`;

  return (
    <Col sm={4}>
      <Card>
        <LinkContainer exact to={url}>
          <a href={url}>
            <Card.Body>
              <h2 className="mb-0">DM Screen</h2>
              <small>Campaign Settings and Player Activity</small>
            </Card.Body>
            </a>
        </LinkContainer>  
      </Card>
    </Col>
  );
};

interface ItemProps {
  campaign: Campaign,
  character: CharacterSummary
}

const defaultAvatarUrl = "/assets/default-avatar.png";

const ListItem: React.FC<ItemProps> = ({ campaign, character }) => {
  const characterUrl = `/campaign/${campaign.id}/character/${character.id}`;
  const avatarUrl =  character.avatarUrl || defaultAvatarUrl;
  const avatarStyle = {
    backgroundImage: `url(${avatarUrl})`
  };

  return (
    <Col sm={4}>
      <Card>
        <LinkContainer exact to={characterUrl}>
          <a href={characterUrl}>
            <Card.Body>
              <div className="d-flex flex-row">
                <div className="character-portrait">
                  <div className="character-avatar" style={avatarStyle} />
                </div>
                <div>
                  <h2 className="mb-0">{character.name}</h2>
                  <small>{character.race} {character.class}</small>
                </div>          
              </div>
            </Card.Body>
            </a>
        </LinkContainer>  
      </Card>
    </Col>
  );
};