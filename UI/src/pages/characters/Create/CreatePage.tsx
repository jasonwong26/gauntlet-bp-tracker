import * as React from "react";
import { RouteComponentProps } from "react-router";


import { Container } from "./_Container";
import { Create } from "./Create";

export const CreatePage: React.FC<RouteComponentProps> = ({ history }) => (
  <Container history={history}>
    {(isSaving, onCreate) => {
      return (
      <Create isSaving={isSaving} onCreate={onCreate} />
      );
    }}
  </Container>
);
