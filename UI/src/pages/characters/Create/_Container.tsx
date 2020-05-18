import React, { useState } from "react";
import { History } from "history";

import {LocalStorageService } from "../../../utility";
import { CharacterService } from "../CharacterService";

import { Character } from "../View/_types";
import { NewCharacter } from "./_types";
import shortid from "shortid";

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

const buildService = () => {
  const storageService = new LocalStorageService();
  const service = new CharacterService(storageService);

  return service;
};

export const Container: React.FC<Props> = ({ history, children }) => {
  const [service] = useState(buildService());
  const [saveState, setSaveState] = useState(SaveState.INACTIVE);

  const onCreate = (input: NewCharacter) => {
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
