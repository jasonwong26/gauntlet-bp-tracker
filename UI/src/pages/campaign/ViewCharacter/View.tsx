import React from "react";
import { Col, Row } from "react-bootstrap";

import { TransactionStatus } from "../../../shared/TransactionStatus";
import { CharacterSummary, Encounter, PurchasedItem, PurchaseItem } from "../../../types";
import { AppState } from "./Activity/_types";
import { LevelControl } from "./Activity/_LevelControl";
import { CharacterProfile } from "./Profile/_Profile";
import { PurchaseBlock } from "./Activity/_PurchaseBlock";
import { History } from "./Activity/_History";


interface Props {
  character: CharacterSummary,
  saving: TransactionStatus,
  app: AppState, 
  updateProfile?: (character: CharacterSummary) => void,
  setEncounter?: (encounter: Encounter) => void, 
  onPurchase?: (item: PurchaseItem) => void, 
  onRemove?: (item: PurchasedItem) => void
}

export const ViewCharacter: React.FC<Props> = ({ character, saving, app, updateProfile, setEncounter, onPurchase, onRemove }) => {
  return (
    <div className="container">
      <Row>
        <Col>
          <CharacterProfile character={character} saving={saving} updateProfile={updateProfile} />
        </Col>
        <Col sm="auto">
          <LevelControl activeEncounter={app.activeEncounter} encounters={app.encounters} onChange={setEncounter} />
        </Col>
      </Row>
      <Row>
        <Col md={5} className="order-md-last order-lg-last order-xl-last">
          <PurchaseBlock app={app} onPurchase={onPurchase} />
        </Col>
        <Col md={7}>
          <History history={app.history} activeEncounter={app.activeEncounter} setEncounter={setEncounter} onDelete={onRemove} />
        </Col>
      </Row>
    </div>
  );
};

