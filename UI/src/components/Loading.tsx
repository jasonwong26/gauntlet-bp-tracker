import * as React from "react";
import FontAwesome from "react-fontawesome";
import {Alert} from "react-bootstrap";
import { TransactionStatus, TransactionState } from "../shared/TransactionStatus";

export const Loading: React.FC = () => (
  <div className="text-center">
      <FontAwesome name="spinner" size="5x" spin />
  </div>
);

interface LoadingByStateProps {
  status: TransactionStatus;
}
export const LoadingByState: React.FC<LoadingByStateProps> = ({status, children}) => {
  if (status.state < TransactionState.SUCCESS) {
    return <Loading />;
  } 
  
  if (status.state === TransactionState.ERRORED) {
    return <Alert variant="danger">loading.message</Alert>
  } 
  
  return (<>{children}</>)
}