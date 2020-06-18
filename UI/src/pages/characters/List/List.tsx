import React, { useState } from "react";
import { Button, Card, Modal } from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";
import FontAwesome from "react-fontawesome";

import { CharacterSummary } from "../_types";

interface Props {
  characters: CharacterSummary[]
  onDelete?: (character: CharacterSummary) => void
}

const defaultAvatarUrl = "/assets/default-avatar.png";

export const List: React.FC<Props> = ({ characters, onDelete}) => {
  const [toDelete, setToDelete] = useState<CharacterSummary>();

  const onDeleteClicked = (character: CharacterSummary) => {
    setToDelete(character);
  };
  const onModalCancel = () => {
    setToDelete(undefined);
  };
  const onModalOk = () => {
    if(!!onDelete && !!toDelete) {
      onDelete(toDelete);
    }
    setToDelete(undefined);
  };
  return (
    <>
    <div className="container">
      <h2>My Characters</h2>
      <hr/>
      <div className="row">
        {characters.map(c => (
          <ListItem key={`character-${c.id}`} character={c} onDelete={onDeleteClicked} />
        ))}
      </div>
    </div>
    { <DeleteModal character={toDelete} onCancel={onModalCancel} onDelete={onModalOk} />}
    </>
  );
};

interface ItemProps {
  character: CharacterSummary
  onDelete?: (character: CharacterSummary) => void
}

const ListItem: React.FC<ItemProps> = ({ character, onDelete }) => {
  const characterUrl = `/character/${character.id}`;
  const avatarUrl =  character.avatarUrl || defaultAvatarUrl;
  const avatarStyle = {
    backgroundImage: `url(${avatarUrl})`
  };
  
  const deleteCharacter = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => { 
    event.preventDefault();

    if(!onDelete) return;
    onDelete(character);
   };

  return (
    <div className="col-4">
      <Card>
        <LinkContainer exact to={characterUrl}>
          <a href={`/character/${character.id}`}>
            <Card.Body>
              <Button className="pull-right close-icon text-danger" variant="link" title="delete" size="sm" onClick={deleteCharacter}>
                <FontAwesome name="times" />
              </Button>
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

interface ModalProps {
  character: CharacterSummary | undefined
  onCancel?: () => void
  onDelete?: () => void
}

const DeleteModal: React.FC<ModalProps> = ({character, onCancel, onDelete}) => {
  return (
    <Modal show={!!character} centered size="sm" onHide={onCancel}>
    <Modal.Header closeButton>
      Delete {character?.name}?
    </Modal.Header>
    <Modal.Footer>
      <Button variant="secondary" size="sm" onClick={onCancel}>
        No
      </Button>
      <Button variant="danger" size="sm" onClick={onDelete}>
        Yes
        <FontAwesome name="times" className="ml-1"/>
      </Button>
    </Modal.Footer>
  </Modal>
  );
};