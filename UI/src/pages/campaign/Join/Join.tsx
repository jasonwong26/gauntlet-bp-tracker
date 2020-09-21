import React from "react";
import { Alert, Card } from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";

import { Campaign, CharacterSummary } from "../../../types";

interface Props {
  campaign: Campaign
}

export const ViewCampaign: React.FC<Props> = ({ campaign }) => {
  const { characters } = campaign;
  return (
  <div className="container">
      <h2>{campaign.title}</h2>
      <small>{campaign.author}</small>
      <p>{campaign.description}</p>
      <hr/>
      <div className="row">
        {!characters.length && (
         <Alert variant="warning">No campaigns found...</Alert>
        )}
        {characters.length && characters.map(c => (
          <ListItem key={`character-${c.id}`} campaign={campaign} character={c} />
        ))}
      </div>

  </div>
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
    <div className="col-4">
      <Card>
        <LinkContainer exact to={characterUrl}>
          <a href={characterUrl}>
            <Card.Body>
              <div className="d-flex flex-row mb-3">
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
    </div>
  );
};