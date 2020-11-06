import React, { useState, useEffect } from "react";
import FontAwesome from "react-fontawesome";
import { Button } from "react-bootstrap";

import { TransactionStatus, TransactionState } from "../shared/TransactionStatus";

interface ButtonByStateProps {
  status: TransactionStatus,
  icon?: string,
  onClick?: () => void,
  [key: string]: unknown
}

interface VariableProps { [key: string]: unknown }

export const ButtonByState: React.FC<ButtonByStateProps> = ({ status, icon, onClick, children, ...rest }) => {
  const [displayState, setDisplayState] = useState<TransactionState>(status.state);
  const [delay, setDelay] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const { state } = status;
    // Edge Case: Force refresh if a new transaction is in process.  Clear Delay here since alternatives cause endless looping
    if(state === TransactionState.PENDING) {
      setDisplayState(status.state);
      setDelay(null);
      return;
    } 

    // Edge Case: initial change to complete status, set delayed action to reset to inactive status
    if(state > TransactionState.PENDING && state !== displayState && !delay) {
      setDisplayState(status.state);

      const timeout = setTimeout(() => {
        setDisplayState(TransactionState.INACTIVE);
      }, 3000);
      setDelay(timeout);
      return;
    }

    // Normal case
    if(!delay && state !== displayState) {
      setDisplayState(status.state);
      return;
    }

    return () => {
      if(!delay) return;
      clearTimeout(delay);
    };

  }, [status, displayState, delay]);

  // Teardown
  useEffect(() => {
    return () => setDelay(null);
  }, []);

  const buttonProps: VariableProps = {...rest};
  const imageProps: FontAwesome.FontAwesomeProps = { name: icon ?? "" };

  if (displayState === TransactionState.PENDING) {
    buttonProps.disabled = true;
    imageProps.spin = true;
    imageProps.name = "refresh";
  }
  if (displayState === TransactionState.SUCCESS) {
    buttonProps.variant = "success";
    imageProps.name = "check";
  } 
  
  if (displayState === TransactionState.ERRORED) {
    buttonProps.variant = "danger";
    imageProps.name = "times";
  } 
  
  return (
    <Button {...buttonProps} onClick={onClick}>
      {children}
      {imageProps.name && (
        <FontAwesome className="ml-1" {...imageProps} />
      )}
    </Button>);
};
