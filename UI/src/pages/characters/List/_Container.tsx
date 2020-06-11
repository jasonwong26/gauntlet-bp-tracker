import React, { useState, useEffect } from "react";

import {LocalStorageService } from "../../../utility";
import { CharacterService, CharacterSummary } from "../CharacterService";
import { CharacterStorageService } from "../CharacterStorageService";

interface Props {
  children: (characters: CharacterSummary[], onDelete: (character: CharacterSummary) => void) => React.ReactNode
}

export const Container: React.FC<Props> = ({ children }) => {
  const [, setRemoteService] = useState<CharacterStorageService>();
  const [service, setService] = useState<CharacterService>();
  const [characters, setCharacters] = useState<CharacterSummary[]>([]);

  // Run onMount
  useEffect(() => {
    const local = new LocalStorageService();
    const remote = new CharacterStorageService();
    const svc = new CharacterService(local, remote);
    setRemoteService(remote);
    setService(svc);

    // Cleanup method
    return () => {
      remote.disconnect();
      setRemoteService(undefined);
    }
  }, []);

  useEffect(() => {
    if(!service) return;

    service.list().then(list => {
      setCharacters(list);
    });
  }, [service]);

  const onDelete = async (character: CharacterSummary) => {
    await service!.delete(character.id);
    const list = await service!.list();
    setCharacters(list);
  };

  return (
    <React.Fragment>
      { children(characters, onDelete) }
    </React.Fragment>
  );
};
