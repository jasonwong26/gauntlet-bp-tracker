import React, { useState, useEffect } from "react";

import {LocalStorageService } from "../../../utility";
import { CharacterService, CharacterSummary } from "../CharacterService";

interface Props {
  children: (characters: CharacterSummary[], onDelete: (character: CharacterSummary) => void) => React.ReactNode
}

const buildService = () => {
  const storageService = new LocalStorageService();
  const service = new CharacterService(storageService);

  return service;
};

export const Container: React.FC<Props> = ({ children }) => {
  const [service] = useState(buildService());
  const [characters, setCharacters] = useState<CharacterSummary[]>([]);

  useEffect(() => {
    service.list().then(list => {
      setCharacters(list);
    });
  }, [service]);

  const onDelete = async (character: CharacterSummary) => {
    await service.delete(character.id);
    const list = await service.list();
    setCharacters(list);
  };

  return (
    <React.Fragment>
      { children(characters, onDelete) }
    </React.Fragment>
  );
};
