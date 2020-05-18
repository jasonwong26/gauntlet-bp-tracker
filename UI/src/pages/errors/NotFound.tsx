import * as React from "react";
import { Alert } from "react-bootstrap";

export const NotFound: React.FC = () => (
  <div className="container">
    <Alert variant="danger">
      <h1>Error</h1>
      <p>Sorry, but we were not able to find the page you requested.</p>
    </Alert>
  </div>
);
