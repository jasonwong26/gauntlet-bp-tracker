import React from "react";
import { Tab, Row, Col, Nav } from "react-bootstrap";

import { CampaignStorageService } from "../CampaignStorageService";
import { View as ViewActivity } from "./Activity/View";
import { View as ViewSettings } from "./Settings/View";
interface Props {
  service: CampaignStorageService
}

export const View: React.FC<Props> = ({ service }) => {
  return (
  <div className="container">
      <h2>DM Controls</h2>
      <hr/>
      <Tab.Container defaultActiveKey="activity">
        <Row>
          <Col sm={2}>
            <Nav variant="pills" className="flex-column">
              <Nav.Item>
                <Nav.Link eventKey="settings">Settings</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="activity">Activity</Nav.Link>
              </Nav.Item>
            </Nav>
          </Col>
          <Col sm={9}>
            <Tab.Content>
              <Tab.Pane eventKey="settings">
                <ViewSettings service={service} />
              </Tab.Pane>
              <Tab.Pane eventKey="activity">
                <ViewActivity service={service} />
              </Tab.Pane>
            </Tab.Content>
          </Col>
        </Row>
      </Tab.Container>
  </div>
  );
};
