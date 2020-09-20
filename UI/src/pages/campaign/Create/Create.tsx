import React, { useState } from "react";
import { Badge, Button, ButtonGroup, Card, Col, ListGroup, Row } from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";
import * as shortid from "shortid";

import { Campaign } from "../_types";
import { CharacterSummary } from "../../characters/_types";
import { TransactionStatus } from "../../../shared/TransactionStatus";
import { CampaignForm } from "../../../components/forms/CampaignForm";
import { CharacterForm } from "../../../components/forms/CharacterForm";
import FontAwesome from "react-fontawesome";
import { CampaignLink } from "../_shared/CampaignLink";

interface Props {
  campaign?: Campaign,
  saving: TransactionStatus,
  onUpdate: (campaign: Campaign) => void
  onCreate: (campaign: Campaign) => void
}

const defaultAvatarUrl = process.env.REACT_APP_DEFAULT_AVATAR_URL!;
const maxCampaignCharacters = 6;

export const CreateCampaign: React.FC<Props> = ({ campaign, saving, onUpdate, onCreate }) => {
  const [step, setStep] = useState<number>(1);

  const onCampaignFormCompleted = (formData: Campaign) => {
    onUpdate(formData);
    setStep(2);
  }

  const onCharacterSaved = (character: CharacterSummary) => {
    if(!campaign) return;

    const updated = [...campaign.characters];
    const index = updated.findIndex(c => c.id === character.id);

    if(index === -1) 
      updated.push(character);
    else
      updated.splice(index, 1, character);
    campaign.characters = updated;

    onUpdate({ ...campaign });
  }
  const onCharacterDeleted = (character: CharacterSummary) => {
    if(!campaign) return;

    const updated = [...campaign.characters];
    const index = updated.findIndex(c => c.id === character.id);

    if(index === -1) return;
      
    updated.splice(index, 1);
    campaign.characters = updated;

    onUpdate({...campaign});
  }

  const onBackClicked = () => {
    setStep(step - 1);
  }
  const onNextClicked = () => {
    setStep(step + 1);
  }
  const onCreateClicked = () => {
    if(!campaign) return;

    onCreate(campaign);
  }
  
  return (
    <div>
      <h2>Create Campaign</h2>
      {step === 1 && (
        <WizardStep step={step} instructions="Provide some basic information to get started:">
          <Card.Body className="pt-0">
            <CampaignForm campaign={campaign} saving={saving} buttonText="Next" onSave={onCampaignFormCompleted} />          
          </Card.Body>
        </WizardStep>
      )}
      {step === 2 && (
        <WizardStep step={step} instructions="Create the party (you can always change this later):" onBackClicked={onBackClicked}>
          <NewCharacterEditor campaign={campaign!} saving={saving} onSave={onCharacterSaved} />
          <CharactersEditor campaign={campaign!} saving={saving} onSave={onCharacterSaved} onDelete={onCharacterDeleted} />
          <Card.Body className="text-right">
            <Button onClick={onNextClicked}>{!!campaign?.characters.length ? "Next" : "Skip"}</Button>
          </Card.Body>
        </WizardStep>
      )}
      {step === 3 && (
        <WizardStep step={step} instructions="Review and create:" onBackClicked={onBackClicked}>          
          <CampaignReview campaign={campaign!} saving={saving} onCreate={onCreateClicked} />
        </WizardStep>
      )}
    </div>
  );
};

interface WizardStepProps {
  step: number,
  instructions: React.ReactNode
  onBackClicked?: () => void,
  onNextClicked?: () => void
  backButtonText?: string,
  nextButtonText?: string,
}

const WizardStep: React.FC<WizardStepProps> = ({ step, instructions, children, onBackClicked, onNextClicked, backButtonText = "Back", nextButtonText = "Next"}) => {
  const renderBackButton = !!onBackClicked;
  const renderNextButton = !!onNextClicked;
  const renderButtons = renderBackButton || renderNextButton;

  return (
    <Card>
      <Card.Body className="pb-1">
        <Row>
          <Col>
            <Card.Title>Step {step}</Card.Title>
            {instructions}
          </Col>
          {renderButtons && (
            <Col sm="auto" className="text-right">
            <ButtonGroup>
              {renderBackButton && (
                <Button size="sm" onClick={onBackClicked}><FontAwesome name="chevron-left" /> {backButtonText}</Button>
              )}
              {renderNextButton && (
                <Button size="sm" onClick={onNextClicked}>{nextButtonText} <FontAwesome name="chevron-right" /></Button>
              )}
            </ButtonGroup>
          </Col>
          )}
        </Row>
      </Card.Body>
      {children}
    </Card>
  );
}

interface NewCharacterEditorProps {
  campaign: Campaign,
  saving: TransactionStatus,
  onSave?: (character: CharacterSummary) => void
}

const NewCharacterEditor: React.FC<NewCharacterEditorProps> = ({campaign, saving, onSave}) => {
  const [isAdding, setIsAdding] = useState<boolean>(campaign.characters.length === 0);

  const toggleAddingCharacter = () => {
    setIsAdding(!isAdding);
  };
  const onAddCharacter = (character: CharacterSummary) => {
    setIsAdding(false);

    if(!onSave) return;

    character.id = shortid.generate();
    onSave(character);
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
    <Card.Body className="py-0">
      <h3>
        <Badge variant="info">{charactersCount} / {maxCampaignCharacters}</Badge>
        <Button size="sm" className="pull-right" {...addButtonProps}>{addButtonText}</Button>
      </h3>
      {isAdding && (
        <CharacterForm saving={saving} buttonText="Add" onSave={onAddCharacter} />
      )}
    </Card.Body>
  );
}

interface CharactersEditorProps {
  campaign: Campaign,
  saving: TransactionStatus,
  onSave?: (character: CharacterSummary) => void
  onDelete?: (character: CharacterSummary) => void
}

const CharactersEditor: React.FC<CharactersEditorProps> = ({ campaign, saving, onSave, onDelete }) => {
  const onUpdateCharacter = (character: CharacterSummary) => {
    if(!onSave) return;

    onSave(character);
  };
  const onDeleteCharacter = (character: CharacterSummary) => {
    if(!onDelete) return;

    onDelete(character);
  };

  return (
    <ListGroup className="list-group-borderless" variant="flush">
      {campaign.characters.map(c => (
        <CharacterEditor key={c.id} character={c} saving={saving} onSave={onUpdateCharacter} onDelete={onDeleteCharacter} />
      ))}
    </ListGroup>
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

interface CampaignReviewProps {
  campaign: Campaign,
  saving: TransactionStatus,
  onCreate?: () => void
} 
const CampaignReview: React.FC<CampaignReviewProps> = ({ campaign, saving, onCreate }) => {
  const buttonProps = {
    disabled: saving.isPending || saving.isComplete
  }
  const buttonText = !saving.isPending ? "Create Campaign" : "Saving...";
  return (
    <>
    <Card.Body className="pb-0">
      <Row>
        <Col>
        <h2>{campaign.title}</h2>
        <small>{campaign.author}</small>
        <p>{campaign.description}</p>
        </Col>
        <Col sm="auto">
          <Button variant="success" onClick={onCreate} {...buttonProps}>{buttonText}</Button>
        </Col>
      </Row>
      {!!campaign.id && (
      <Row>
        <Col>
          <CampaignLink campaign={campaign} />
        </Col>
        <Col>
          <p>Congratulations! Your campaign is ready to use.  <br/> Couple of things to keep in mind:</p>
          <ul>
            <li>This site does not require authentication, so your ability to access the campaign depends on you holding onto the campaign link.  Make sure to copy this down somewhere safe just in case.</li>
            <li>This link is also how you can share the campaign with friends!  Just send them the link and they'll be able to access it as well.</li>
            <li>
              <span>You can change all of the settings you just entered (and more!) via the </span> 
              <LinkContainer exact to={`/campaign/${campaign.id}/dm-controls?defaultTab=campaign`}>
                <a href={`/campaign/${campaign.id}/dm-controls?defaultTab=campaign`}>DM Page</a>
              </LinkContainer>
              <span> for your campaign.</span>
              </li>
            <li>To keep costs down, campaigns without recent activity will be deleted after 60 days.</li>
          </ul>
          <p>
            <span>Click </span> 
            <LinkContainer exact to={`/campaign/${campaign.id}/dm-controls`}>
              <a href={`/campaign/${campaign.id}`}>here</a>
            </LinkContainer>
            <span> or use the 'My Campaigns' link above to get started.</span>
          </p>
        </Col>
      </Row>
      )}
    </Card.Body>
    <ListGroup className="pb-2 list-group-nohover list-group-borderless" horizontal>
      {campaign.characters.map(c => {
          const avatarUrl =  c.avatarUrl || defaultAvatarUrl;
          const avatarStyle = {
            backgroundImage: `url(${avatarUrl})`
          };
          return (
            <ListGroup.Item key={c.id}>
              <div className="d-flex flex-row">
                <div className="character-portrait">
                  <div className="character-avatar" style={avatarStyle} />
                </div>
                <div>
                  <h5 className="mb-0">{c.name}</h5>
                  <small>{c.race} {c.class}</small>
                </div>          
              </div>
          </ListGroup.Item> 
        );
      })}
    </ListGroup>
    </>
  );
}