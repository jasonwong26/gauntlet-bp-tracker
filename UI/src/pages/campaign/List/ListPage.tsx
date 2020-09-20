import * as React from "react";
import { RouteComponentProps } from "react-router";

import { Container } from "./_Container";
import { List } from "./List";

export const ListPage: React.FC<RouteComponentProps> = () => (
  <div className="container">
    <Container>
      {(campaigns, onDelete) => {
        return (
        <List campaigns={campaigns} onDelete={onDelete} />
        );
      }}
    </Container>
  </div>
);
