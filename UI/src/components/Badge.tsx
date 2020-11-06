import React, { useState, useEffect } from "react";
import FontAwesome from "react-fontawesome";
import { Badge } from "react-bootstrap";

import { TransactionStatus, TransactionState } from "../shared/TransactionStatus";

interface BadgeByStateProps {
  status: TransactionStatus,
  icon?: string,
  [key: string]: unknown
}

interface VariableProps { [key: string]: unknown }

export const BadgeByState: React.FC<BadgeByStateProps> = ({ status, icon, children, ...rest }) => {
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
  }, [status, displayState, delay]);

  // Teardown
  useEffect(() => {
    return () => setDelay(null);
  }, []);

  const badgeProps: VariableProps = {...rest};
  const imageProps: FontAwesome.FontAwesomeProps = { name: icon ?? "" };

  if (displayState === TransactionState.PENDING) {
    imageProps.spin = true;
    imageProps.name = "refresh";
  }
  if (displayState === TransactionState.SUCCESS) {
    badgeProps.variant = "success";
    imageProps.name = "check";
  } 
  
  if (displayState === TransactionState.ERRORED) {
    badgeProps.variant = "danger";
    imageProps.name = "times";
  } 
  
  return (
    <Badge {...badgeProps}>
      {children}
      {imageProps.name && (
        <FontAwesome className="ml-1" {...imageProps} />
      )}
    </Badge>);
};
