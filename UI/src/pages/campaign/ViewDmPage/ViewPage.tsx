import * as React from "react";
import { RouteComponentProps } from "react-router";

import { Container } from "./_Container";
import { View } from "./View";
import { ToastContainer } from "../../../components/Toast";

interface RouteParams {
  id: string
}

export const ViewPage: React.FC<RouteComponentProps<RouteParams>> = ({ match }) => {
  const id = match.params.id;

  return (
    <Container campaignId={id}>
      {(service, toasts, onToastClose)  => (
        <ToastContainer notifications={toasts} onClose={onToastClose}>
          <View service={service} />
        </ToastContainer>
      )}
    </Container>
  );
};
