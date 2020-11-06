import React, { useState } from "react";
import { Button } from "react-bootstrap";
import FontAwesome from "react-fontawesome";

import { CharacterSummary } from "../../../../types";
import { CharacterForm } from "../../../../components/forms/CharacterForm";
import { TransactionStatus } from "../../../../shared/TransactionStatus";

interface Props {
  character: CharacterSummary,
  saving: TransactionStatus,
  updateProfile?: (character: CharacterSummary) => void
}

const defaultAvatarUrl = process.env.REACT_APP_DEFAULT_AVATAR_URL || "";

export const CharacterProfile: React.FC<Props> = ({ character, saving, updateProfile }) => {
  const [isEditing, setIsEditing] = useState(false);

  const toggleEditing = () => {
    setIsEditing(e => !e);
  };
  const handleSave = (character: CharacterSummary) => {
    setIsEditing(false);
    if(updateProfile) updateProfile(character);
  };

  const avatarUrl =  character.avatarUrl ?? defaultAvatarUrl;
  const avatarStyle = {
    backgroundImage: `url(${avatarUrl})`
  };
  
  return (
    <>
    {!isEditing && (
      <div className="d-flex flex-row mb-3">
        <div className="character-portrait">
          <div className="character-avatar" style={avatarStyle} />
        </div>
        <div>
          <h2 className="mb-0">{character.name}<Button className="ml-1 btn-noborder" size="sm" variant="url" title="Edit Character" onClick={toggleEditing}><FontAwesome name="cog" /></Button></h2>
          <small>{character.race} {character.class}</small>
        </div>          
      </div>
    )}
    {!!isEditing && (
      <CharacterForm character={character} saving={saving} buttonText="Save" onCancel={toggleEditing} onSave={handleSave} />
    )}
    </>
  );
};
