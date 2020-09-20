import React, { useState, useEffect, useRef } from "react";
import { Form, Button, Row, Col } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { Campaign } from "../../pages/campaign/_types";
import { TransactionStatus } from "../../shared/TransactionStatus";

interface CampaignFormProps {
  campaign?: Campaign,
  saving: TransactionStatus,
  buttonText?: string, 
  onCancel?: () => void
  onSave?: (campaign: Campaign) => void
}
interface CampaignFormData {
  title: string,
  description?: string,
  author: string,
  authorEmail?: string
}

const buildCampaignTemplate = () => {
  const template: Campaign = {
    id: "",
    author: "",
    title: "",
    description: "",
    characters: []    
  };

  return template;
};

export const CampaignForm: React.FC<CampaignFormProps> = ({ campaign = buildCampaignTemplate(), saving, buttonText = "Submit", onCancel, onSave }) => {
  const firstInput = useRef<HTMLInputElement | null>(null);
  const [validated, setValidated] = useState<boolean>(false);

  useEffect(() => {
    firstInput?.current?.focus();
  }, []);

  const { register, handleSubmit, errors } = useForm<CampaignFormData>();
  const onCancelClick = () => {
    if(onCancel) onCancel();
  };
  const onSuccess = (data: CampaignFormData) => {
    setValidated(true);
    if(!onSave) return;
    
    const updated = { ...campaign, ...data };
    onSave(updated);
  };
  const onFailure = () => {
    setValidated(true);
  };

  const buttonProps = {
    disabled: saving.isPending,
  }
  const _buttonText = saving.isPending ? "Saving..." : buttonText;

  return (
    <Form noValidate validated={validated} onSubmit={handleSubmit(onSuccess, onFailure)}>
      <Form.Group controlId="title">
        <Form.Label>Title</Form.Label>
        <Form.Control name="title" type="text" 
          required
          minLength={3}
          maxLength={100} 
          defaultValue={campaign.title}
          ref={(instance: HTMLInputElement | null) => {
            register(instance, { 
              required: "Please specify the Campaign title",
              minLength: { value: 3, message: "The title should be between 3 and 100 characters long." },
              maxLength: { value: 100, message: "The title should be between 3 and 100 characters long." }
            });
            firstInput.current = instance;
          }} />
        {!!errors.title && (
          <Form.Control.Feedback type="invalid">
            {errors.title.message}
          </Form.Control.Feedback>
        )}
      </Form.Group>
      <Form.Group controlId="description">
        <Form.Label>Description</Form.Label>
        <Form.Control name="description" as="textarea" 
          rows={2} 
          maxLength={200}
          defaultValue={campaign.description}
          ref={register({ 
            maxLength: { value: 200, message: "The Description should be no longer than 200 characters." }
          })} />
        {!!errors.description && (
          <Form.Control.Feedback type="invalid">
            {errors.description.message}
          </Form.Control.Feedback>
        )}
      </Form.Group>
      <Form.Group controlId="author">
        <Form.Label>Author</Form.Label>
        <Form.Control name="author" type="text" 
          required
          minLength={3}
          maxLength={100} 
          defaultValue={campaign.author}
          ref={register({
            required: "Please specify the Campaign author",
            minLength: { value: 3, message: "The author's name should be between 3 and 100 characters long." },
            maxLength: { value: 100, message: "The author's name should be between 3 and 100 characters long." }
          })} />
        {!!errors.author && (
          <Form.Control.Feedback type="invalid">
            {errors.author.message}
          </Form.Control.Feedback>
        )}
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