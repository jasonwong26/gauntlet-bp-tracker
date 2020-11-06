import React from "react";
import FontAwesome from "react-fontawesome";
import { Button } from "react-bootstrap";

interface EditButtonProps {
  onClick?: () => void,
  [key: string]: unknown
}

export const EditButton: React.FC<EditButtonProps> = ({ onClick, ...rest }) => {

  return (
    <Button title="Edit" className="px-0 py-0" variant="link" onClick={onClick} {...rest}>
      <FontAwesome name="cog" />
    </Button>);
};
