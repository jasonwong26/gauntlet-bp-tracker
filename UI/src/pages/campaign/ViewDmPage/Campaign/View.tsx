import React, { useState, useEffect } from "react";
import { Card, ListGroup, Button, Row, Col, ButtonGroup, Badge } from "react-bootstrap";
import * as shortid from "shortid";

import { Campaign, CharacterSummary } from "../../../../types";
import { TransactionStatus } from "../../../../shared/TransactionStatus";
import { CampaignStorageService } from "../../CampaignStorageService2";
import { CampaignListService } from "../../List/CampaignListService";
import { Container } from "./_Container";
import { SavingDisplay } from "../../_shared/SavingDisplay";
import { CampaignLink } from "../../_shared/CampaignLink";
import { CampaignForm } from "../../../../components/forms/CampaignForm";
import { CharacterForm } from "../../../../components/forms/CharacterForm";

interface Props {
  service: CampaignStorageService,
  listService: CampaignListService
}

const defaultAvatarUrl = process.env.REACT_APP_DEFAULT_AVATAR_URL!;
const maxCampaignCharacters = 6;

export const View: React.FC<Props> = ({ service, listService }) => (
  <Container service={service} listService={listService}>
    {(campaign, saving, onSave, onDelete, onCharacterSave, onCharacterDelete) => (
     <ViewCampaign campaign={campaign} saving={saving} onSave={onSave} onDelete={onDelete} onCharacterSave={onCharacterSave} onCharacterDelete={onCharacterDelete} />
    )}
  </Container>
);

interface ViewCampaignProps {
  campaign: Campaign,
  saving: TransactionStatus,
  onSave: (campaign: Campaign) => void,
  onDelete: (campaign: Campaign) => void,
  onCharacterSave: (character: CharacterSummary) => void,
  onCharacterDelete: (character: CharacterSummary) => void
}

const ViewCampaign: React.FC<ViewCampaignProps> = ({ campaign, saving, onSave, onDelete, onCharacterSave, onCharacterDelete }) => {
  return (
    <>
      <SavingDisplay saving={saving} />
      <CampaignEditor campaign={campaign} saving={saving} onSave={onSave} onDelete={onDelete} />
      <CharactersEditor campaign={campaign} saving={saving} onSave={onCharacterSave} onDelete={onCharacterDelete} />
    </>
  );
};

interface CampaignEditorProps {
  campaign: Campaign,
  saving: TransactionStatus,
  onSave?: (campaign: Campaign) => void,
  onDelete?: (campaign: Campaign) => void
}
const CampaignEditor: React.FC<CampaignEditorProps> = ({ campaign, saving, onSave, onDelete }) => {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  useEffect(() => {
    if(isSaving && saving.isComplete) {
      setIsSaving(false);
      setIsEditing(false);
    }
  }, [saving, isEditing, isSaving]);

  const toggleIsEditing = () => {
    setIsEditing(!isEditing);
  };
  const toggleIsDeleting = () => {
    setIsDeleting(!isDeleting);
  };
  const handleSave = (updated: Campaign) => {
    setIsSaving(true);
    if(onSave) onSave(updated);
  };
  const handleDelete = () => {
    setIsSaving(true);
    if(onDelete) onDelete(campaign);
  };

  const buttonDisabled = !isEditing && !isDeleting && saving.isPending
  const editButtonText = !isEditing ? "Edit" : "Cancel";
  const deleteButtonText = !isDeleting ? "Delete" : "Cancel";

  return (
    <Card className="mb-3">
      <Card.Body>
        <Row>
          <Col>
            <h3>Campaign</h3>
          </Col>
          <Col sm="auto">
            <ButtonGroup>
              <Button size="sm" disabled={buttonDisabled} onClick={toggleIsEditing}>{editButtonText}</Button>
              <Button size="sm" variant="danger"  disabled={buttonDisabled} onClick={toggleIsDeleting}>{deleteButtonText}</Button>
            </ButtonGroup>
          </Col>
        </Row>
        { !isEditing && !isDeleting && (
          <>
            <Card.Title>{campaign.title}</Card.Title>
            <Card.Subtitle className="mb-2 text-muted">{campaign.author}</Card.Subtitle>
            <Card.Text>{campaign.description}</Card.Text>
            <CampaignLink campaign={campaign} />
          </>
        )}

        { isEditing && (
          <CampaignForm campaign={campaign} saving={saving} onSave={handleSave} />
        )}

        { isDeleting && (
          <Row>
            <Col>
              <Card.Title>{campaign.title}</Card.Title>
              <Card.Subtitle className="mb-2 text-muted">{campaign.author}</Card.Subtitle>
              <Card.Text>{campaign.description}</Card.Text>
              <p>Are you sure?  All campaign data will be deleted.</p>
              <p>This action is irreversible.</p>
              <Button size="sm" onClick={toggleIsDeleting}>No</Button>
              <Button size="sm" className="ml-3" onClick={handleDelete}>Yes</Button>
            </Col>
          </Row>
        )}
      </Card.Body>
    </Card>
  );
};

interface CharactersEditorProps {
  campaign: Campaign,
  saving: TransactionStatus,
  onSave?: (character: CharacterSummary) => void
  onDelete?: (character: CharacterSummary) => void
}

const CharactersEditor: React.FC<CharactersEditorProps> = ({ campaign, saving, onSave, onDelete }) => {
  const [isAdding, setIsAdding] = useState<boolean>(false);

  const toggleAddingCharacter = () => {
    setIsAdding(!isAdding);
  };
  const onAddCharacter = (character: CharacterSummary) => {
    setIsAdding(false);

    if(!onSave) return;

    character.id = shortid.generate();
    onSave(character);
  };
  const onUpdateCharacter = (character: CharacterSummary) => {
    if(!onSave) return;

    onSave(character);
  };
  const onDeleteCharacter = (character: CharacterSummary) => {
    if(!onDelete) return;

    onDelete(character);
  };

  const charactersCount = campaign.characters.length;
  const hasReachedMaxCharacters = charactersCount >= maxCampaignCharacters;
  const hasOtherOngoingTransaction = !isAdding && saving.isPending;
  const addButtonProps = {
    disabled: hasReachedMaxCharacters || hasOtherOngoingTransaction,
    onClick: toggleAddingCharacter
  }
  const addButtonText = !isAdding ? "Add Character" : "Cancel";

  return (
    <Card className="mb-3">
      <Card.Body className="mb-0 pb-1">
        <h3>
          Characters 
          <Badge className="ml-2" variant="info">{charactersCount} / {maxCampaignCharacters}</Badge>
          <Button size="sm" className="pull-right" {...addButtonProps}>{addButtonText}</Button>
        </h3>
        {isAdding && (
          <CharacterForm saving={saving} onSave={onAddCharacter} />
        )}
      </Card.Body>
      <ListGroup variant="flush">
        {campaign.characters.map(c => (
          <CharacterEditor key={c.id} character={c} saving={saving} onSave={onUpdateCharacter} onDelete={onDeleteCharacter} />
        ))}
      </ListGroup>
    </Card>
  );
};

interface CharacterEditorProps {
  character: CharacterSummary,
  saving: TransactionStatus,
  onSave?: (character: CharacterSummary) => void
  onDelete?: (character: CharacterSummary) => void
}

const CharacterEditor: React.FC<CharacterEditorProps> = ({ character, saving, onSave, onDelete }) => {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const toggleIsEditing = () => {
    setIsEditing(!isEditing);
  };
  const handleSave = (updated: CharacterSummary) => {
    setIsEditing(false);
    if(onSave) onSave(updated);
  };

  const toggleIsDeleting = () => {
    setIsDeleting(!isDeleting);
  };
  const handleDelete = () => {
    setIsDeleting(false);
    if(onDelete) onDelete(character);
  };

  const buttonDisabled = !isEditing && !isDeleting && saving.isPending
  const buttonText = !isEditing ? "Edit" : "Cancel";
  const avatarUrl =  character.avatarUrl || defaultAvatarUrl;
  const avatarStyle = {
    backgroundImage: `url(${avatarUrl})`
  };

  return (
    <ListGroup.Item key={character.id}>
      {!isEditing && !isDeleting && (
        <Row>
          <Col>
            <div className="d-flex flex-row">
              <div className="character-portrait">
                <div className="character-avatar" style={avatarStyle} />
              </div>
              <div>
                <h5 className="mb-0">{character.name}</h5>
                <small>{character.race} {character.class}</small>
              </div>          
            </div>
          </Col>
          <Col className="text-right" sm="auto" md="auto" lg ="auto" xl="auto">
            <ButtonGroup>
              <Button size="sm" disabled={buttonDisabled} onClick={toggleIsEditing}>{buttonText}</Button>
              <Button size="sm" variant="danger" disabled={buttonDisabled} onClick={toggleIsDeleting}>Delete</Button>
            </ButtonGroup>
          </Col>
        </Row>
      )}
      {isEditing && (
        <>
        <Row>
          <Col className="text-right">
            <Button size="sm" onClick={toggleIsEditing}>{buttonText}</Button>
          </Col>
        </Row>
        <CharacterForm character={character} saving={saving} onSave={handleSave} />
        </>
      )}
      {isDeleting && (
        <Row>
          <Col>
            <p>Are you sure?  This action is irreversible.</p>
            <Button size="sm" onClick={toggleIsDeleting}>No</Button>
            <Button size="sm" className="ml-3" onClick={handleDelete}>Yes</Button>
          </Col>
        </Row>
      )}
    </ListGroup.Item>    
  );
};
