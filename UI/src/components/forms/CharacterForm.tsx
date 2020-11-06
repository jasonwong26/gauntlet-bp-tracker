import React, { useState, useEffect, useRef } from "react";
import { Form, Button, Row, Col } from "react-bootstrap";
import { useForm } from "react-hook-form";
import url from "url";

import { TransactionStatus } from "../../shared/TransactionStatus";
import { CharacterSummary } from "../../types";

interface CharacterFormProps {
  character?: CharacterSummary,
  saving: TransactionStatus,
  buttonText?: string, 
  onCancel?: () => void
  onSave?: (character: CharacterSummary) => void
}
interface CharacterFormData {
  name: string,
  avatarUrl?: string,
  race: string,
  class: string
}

const defaultAvatarUrl = process.env.REACT_APP_DEFAULT_AVATAR_URL || "";

const buildCharacterTemplate = () => {
  const template: CharacterSummary = {
    id: "",
    name: "",
    race: "",
    class: ""
  };

  return template;
};

export const CharacterForm: React.FC<CharacterFormProps> = ({character = buildCharacterTemplate(), saving, buttonText="Submit", onCancel, onSave }) => {
  const firstInput = useRef<HTMLInputElement | null>(null);
  const [validated, setValidated] = useState<boolean>(false);

  useEffect(() => {
    firstInput?.current?.focus();
  }, []);

  const { register, handleSubmit, watch, errors } = useForm<CharacterFormData>();

  const onCancelClick = () => {
    if(onCancel) onCancel();
  };

  const validateUrl = (value?: string) => {
    const isValid = !value || !!url.parse(value).host;
    
    return isValid || "Not a valid Url";
  };

  const onSuccess = (data: CharacterFormData) => {
    setValidated(true);
    if(!onSave) return;

    const updated = { ...character, ...data };

    if(!updated.avatarUrl) {
      updated.avatarUrl = undefined;
    }

    onSave(updated);
  };
  const onFailure = () => {
    setValidated(true);
  };

  const avatarUrl =  watch("avatarUrl") || defaultAvatarUrl;
  const avatarStyle = {
    backgroundImage: `url(${avatarUrl})`
  };

  const buttonProps = {
    disabled: saving.isPending
  };
  const _buttonText = saving.isPending ? "Saving..." : buttonText;

  return (
    <Form className="mb-3" noValidate validated={validated} onSubmit={handleSubmit(onSuccess, onFailure)}>
      <Form.Group controlId="name">
        <Form.Label>Name</Form.Label>
        <Form.Control name="name" type="text" 
          required
          minLength={3}
          maxLength={100} 
          defaultValue={character.name}
          ref={(instance: HTMLInputElement | null) => {
            register(instance, { 
              required: "Please specify the Character's name",
              minLength: { value: 3, message: "The name should be between 3 and 100 characters long." },
              maxLength: { value: 100, message: "The name should be between 3 and 100 characters long." }
            });
            firstInput.current = instance;
          }} />
        {!!errors.name && (
          <Form.Control.Feedback type="invalid">
            {errors.name.message}
          </Form.Control.Feedback>
        )}
      </Form.Group>
      <Form.Group controlId="race">
        <Form.Label>Race</Form.Label>
        <Form.Control name="race" type="text" 
          required
          minLength={3}
          maxLength={100}
          defaultValue={character.race} 
          ref={register({
            required: "Please specify the Character's race",
            minLength: { value: 3, message: "The race should be between 3 and 100 characters long." },
            maxLength: { value: 100, message: "The race should be between 3 and 100 characters long." }
          })} />
        {!!errors.race && (
          <Form.Control.Feedback type="invalid">
            {errors.race.message}
          </Form.Control.Feedback>
        )}
      </Form.Group>
      <Form.Group controlId="class">
        <Form.Label>Class</Form.Label>
        <Form.Control name="class" type="text" 
          required
          minLength={3}
          maxLength={100} 
          defaultValue={character.class}
          ref={register({
            required: "Please specify the Character's class",
            minLength: { value: 3, message: "The class should be between 3 and 100 characters long." },
            maxLength: { value: 100, message: "The class should be between 3 and 100 characters long." }
          })} />
        {!!errors.class && (
          <Form.Control.Feedback type="invalid">
            {errors.class.message}
          </Form.Control.Feedback>
        )}
      </Form.Group>
      <Form.Group controlId="avatarUrl">
        <Form.Label>Avatar URL</Form.Label>
        <Form.Control name="avatarUrl" type="url" 
          defaultValue={character.avatarUrl}
          ref={register({
            validate: validateUrl
          })} />
        <Form.Control.Feedback type="invalid">
          {errors.avatarUrl?.message}
        </Form.Control.Feedback>
        <Form.Control.Feedback type="valid">
          <div className="character-portrait">
            <div className="character-avatar" style={avatarStyle} />
          </div>
        </Form.Control.Feedback>
      </Form.Group>
      <Row>
        {!!onCancel && (
          <Col>
            <Button onClick={onCancelClick}>Cancel</Button> 
          </Col>
        )}
        <Col className="text-right">
          <Button type="submit" {...buttonProps}>{_buttonText}</Button> 
        </Col>
      </Row>
    </Form>
  );
};