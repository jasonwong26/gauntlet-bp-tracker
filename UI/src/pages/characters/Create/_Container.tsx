import React, { useState, useEffect } from "react";
import shortid from "shortid";
import { History } from "history";

import {LocalStorageService } from "../../../utility";
import { CharacterService } from "../CharacterService";
import { CharacterStorageService } from "../CharacterStorageService";

import { Character } from "../View/_types";
import { NewCharacter } from "./_types";

interface Props {
  history: History,
  children: (isSaving?: boolean, onCreate?: (character: NewCharacter) => void) => React.ReactNode
}

enum SaveState {
  INACTIVE = 0,
  PENDING = 1,
  SAVED = 2,
  ERRORED = 3
}

export const Container: React.FC<Props> = ({ history, children }) => {
  const [, setRemoteService] = useState<CharacterStorageService>();
  const [service, setService] = useState<CharacterService>();
  const [saveState, setSaveState] = useState(SaveState.INACTIVE);

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
    };
  }, []);

  const onCreate = (input: NewCharacter) => {
    if (!service) throw new Error("service not initialized!");
    
    setSaveState(SaveState.PENDING);

    const character: Character = {
      ...input,
      id: input.id ?? shortid.generate(),
      history: []
    };

    service.create(character)
      .then(() => {
        const newSaveState = SaveState.SAVED;
        setSaveState(newSaveState);

        if(newSaveState !== SaveState.SAVED) return;
        history.push(`/character/${character.id}`);
      })
      .catch(() => {
        setSaveState(SaveState.ERRORED);
      });
  };

  const isSaving = saveState !== SaveState.INACTIVE;

  return (
    <React.Fragment>
      { children(isSaving, onCreate) }
    </React.Fragment>
  );
};
