import * as React from "react";
import { RouteComponentProps } from "react-router";
import qs from "qs";

import { Container } from "./_Container";
import { View } from "./View";
import { ToastContainer } from "../../../components/Toast";

interface RouteParams {
  id: string
}

export const ViewPage: React.FC<RouteComponentProps<RouteParams>> = ({ match, location }) => {
  const id = match.params.id;
  const search = location.search.substring(1);
  const queryStrings = qs.parse(search);
  const defaultTab = queryStrings.defaultTab as string | undefined;

  return (
    <div className="container">
      <Container campaignId={id}>
        {(service, listService, toasts, onToastClose)  => (
          <ToastContainer notifications={toasts} onClose={onToastClose}>
            <View service={service} listService={listService} defaultTab={defaultTab} />
          </ToastContainer>
        )}
      </Container>
    </div>
  );
};
