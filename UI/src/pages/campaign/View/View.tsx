import React, { useState } from "react";
import { Button, Card, Col, Row } from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";

import { Campaign, CharacterSummary } from "../../../types";

interface Props {
  campaign: Campaign,
  onLeave: () => void
}

export const ViewCampaign: React.FC<Props> = ({ campaign, onLeave }) => {
  const [isLeaving, setIsLeaving] = useState(false);  
  const { characters } = campaign;

  const toggleIsLeaving = () => {
    setIsLeaving(is => !is);
  };

  return (
  <>
    <Row>
      <Col>
        <h2>{campaign.title}</h2>
        <small>{campaign.author}</small>
        <p>{campaign.description}</p>
      </Col>
      <Col sm="auto">
        {!isLeaving && (
          <Button variant="danger" onClick={toggleIsLeaving}>Leave Campaign</Button>
        )}
        {!!isLeaving && (
          <div className="text-right">
            <p>Are you sure you want to leave this campaign?</p>
            <Button size="sm" onClick={toggleIsLeaving}>No</Button>
            <Button size="sm" className="ml-3" onClick={onLeave}>Yes</Button>
          </div>
        )}
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