
import React from "react";
import { Alert, Row, Col } from "react-bootstrap";

import { BadgeByState } from "../../../components/Badge";
import { TransactionStatus } from "../../../shared/TransactionStatus";

interface SavingDisplayProps {
  saving: TransactionStatus
}

export const SavingDisplay: React.FC<SavingDisplayProps> = ({ saving }) => (
  <Row className="mb-2">
    <Col>
      {saving.isErrored && (
        <Alert className="mb-0" variant="danger">
          We are having trouble connecting with the server, your changes may not have been saved.
        </Alert>
      )}
    </Col>
    <Col className="text-right" sm="auto">
      <BadgeByState className="text-left" status={saving} icon="refresh" />
    </Col>
  </Row>
);