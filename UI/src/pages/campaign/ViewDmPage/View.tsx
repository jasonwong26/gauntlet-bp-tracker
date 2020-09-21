import React from "react";
import { Tab, Row, Col, Nav } from "react-bootstrap";

import { CampaignStorageService } from "../CampaignStorageService2";
import { CampaignListService } from "../List/CampaignListService";
import { View as ViewActivity } from "./Activity/View";
import { View as ViewCampaign } from "./Campaign/View";
import { View as ViewSettings } from "./Settings/View";
interface Props {
  service: CampaignStorageService,
  listService: CampaignListService,
  defaultTab?: string
}

export const View: React.FC<Props> = ({ service, listService, defaultTab }) => {
  const tabs = ["activity", "campaign", "settings"];
  const isValidTab = tabs.includes(defaultTab ?? "");
  const activeTab = isValidTab ? defaultTab : tabs[0];

  return (
  <>
    <h2>DM Controls</h2>
    <hr/>
    <Tab.Container defaultActiveKey={activeTab}>
      <Row>
        <Col sm={2}>
          <Nav variant="pills" className="flex-column">
            <Nav.Item>
              <Nav.Link eventKey={tabs[0]}>Activity</Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey={tabs[1]}>Campaign</Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey={tabs[2]}>Settings</Nav.Link>
            </Nav.Item>
          </Nav>
        </Col>
        <Col sm={9}>
          <Tab.Content>
            <Tab.Pane eventKey={tabs[0]}>
              <ViewActivity service={service} />
            </Tab.Pane>
            <Tab.Pane eventKey={tabs[1]}>
              <ViewCampaign service={service} listService={listService} />
            </Tab.Pane>
            <Tab.Pane eventKey={tabs[2]}>
              <ViewSettings service={service} />
            </Tab.Pane>
          </Tab.Content>
        </Col>
      </Row>
    </Tab.Container>
  </>
  );
};
