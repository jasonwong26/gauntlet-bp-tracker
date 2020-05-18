import React from "react";

import { Profile } from "./_types";

interface Props {
  profile: Profile
}

export const CharacterProfile: React.FC<Props> = ({ profile }) => {
  const avatarUrl =  profile.avatarUrl;
  const avatarStyle = {
    backgroundImage: `url(${avatarUrl})`
  };
  
  return (
  <div className="d-flex flex-row mb-3">
    <div className="character-portrait">
      <div className="character-avatar" style={avatarStyle} />
    </div>
    <div>
      <h2 className="mb-0">{profile.name}</h2>
      <small>{profile.race} {profile.class}</small>
    </div>          
  </div>
  );
};
