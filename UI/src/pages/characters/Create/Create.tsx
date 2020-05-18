import url from "url";
import React, { useState } from "react";
import { Form, Button } from "react-bootstrap";

import { NewCharacter } from "./_types";

const template: NewCharacter = {
  name: "",
  race: "",
  class: "",
  avatarUrl: undefined
};

interface FieldState {
  value?: any,
  state?: boolean
  errors?: string
}

const buildFormState = () => {
  const map = new Map<string,FieldState>();

  Object.keys(template).forEach(key => {
    map.set(key, {value: undefined, state: undefined, errors: undefined});
  });

  return map;
};

interface Props {
  isSaving?: boolean,
   onCreate?: (character: NewCharacter) => void
}

export const Create: React.FC<Props> = ({ onCreate }) => {
  const [character, setCharacter] = useState({...template});
  const [formState, setFormState] = useState(buildFormState());

  const onCharacterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const name = event.target.name;
    const value = event.target.value;
    // console.log("character  changed...", {name, value, formState});
    setCharacter({...character, [name]: value});
  };

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    // console.log("form submited...", { character, formState});
    event.preventDefault();
    const state = validateForm();

    let isValid = true;
    state.forEach(val => {
      isValid = isValid && val.state === true;
    });

    if(!isValid) return;
    // console.log("creating character for input: ", character);
    if(!onCreate) return;
    onCreate(character);
  };
  const validateForm = () => {
    const newState = buildFormState();
    newState.set("name", validateString(character.name));
    newState.set("race", validateString(character.race));
    newState.set("class", validateString(character.class));
    newState.set("avatarUrl", validateUrl(character.avatarUrl));

    setFormState(newState);
    return newState;
  };
  const validateString = (value: string) => {
    return {
      value,
      state: !!value && value.length <= 100,
      errors: "Required"
    };
  };
  const validateUrl = (value: string | undefined) => {
    return {
      value,
      state: !value || !!url.parse(value).host,
      errors: "Not a valid URL"
    };
  };

  const isFieldValid = (name: string) => {
    const fieldState = formState.get(name)!;
    const state = fieldState.state;

    return state != null && !!state && !!fieldState.value;
  };
  const isFieldInvalid = (name: string) => {
    const fieldState = formState.get(name)!;
    const state: boolean | undefined = fieldState.state;
    return state != null && !state;    
  };
  const getFieldErrors = (name: string) => {
    const fieldState = formState.get(name)!;
    return fieldState.errors;
  };

  return (
    <div className="container">
      <h2>Create Character</h2>
      <hr/>
      <Form onSubmit={onSubmit} noValidate>
        <Form.Group controlId="name">
          <Form.Label>Name</Form.Label>
          <Form.Control name="name" type="text" required value={character.name} maxLength={100} isValid={isFieldValid("name")} isInvalid={isFieldInvalid("name")} onChange={onCharacterChange} />
          <Form.Control.Feedback type="invalid">{getFieldErrors("name")}</Form.Control.Feedback>
        </Form.Group>
        <div className="row">
          <div className="col">
            <Form.Group controlId="race">
              <Form.Label>Race</Form.Label>
              <Form.Control name="race" type="text" required value={character.race} isValid={isFieldValid("race")} isInvalid={isFieldInvalid("race")} onChange={onCharacterChange} />
              <Form.Control.Feedback type="invalid">{getFieldErrors("race")}</Form.Control.Feedback>
            </Form.Group>
          </div>
          <div className="col">
            <Form.Group controlId="class">
              <Form.Label>Class</Form.Label>
              <Form.Control name="class" type="text" required value={character.class} isValid={isFieldValid("class")} isInvalid={isFieldInvalid("class")} onChange={onCharacterChange} />
              <Form.Control.Feedback type="invalid">{getFieldErrors("class")}</Form.Control.Feedback>
            </Form.Group>
          </div>
        </div>
        <Form.Group controlId="avatar">
          <Form.Label>Avatar URL</Form.Label>
          <Form.Control name="avatarUrl" type="url" value={character.avatarUrl || ""}  isValid={isFieldValid("avatarUrl")} isInvalid={isFieldInvalid("avatarUrl")} onChange={onCharacterChange} />
          <Form.Control.Feedback type="invalid">{getFieldErrors("avatarUrl")}</Form.Control.Feedback>
        </Form.Group>

        <Button variant="outline-info"
                type="submit"
                className="float-right">Create</Button>
      </Form>
    </div>
  );
};


