import * as React from "react";
import { RouteComponentProps } from "react-router";

import { Container } from "./_Container";
import { List } from "./List";

export const ListPage: React.FC<RouteComponentProps> = () => (
  <Container>
    {(characters, onDelete) => {
      return (
      <List characters={characters} onDelete={onDelete} />
      );
    }}
  </Container>
);
