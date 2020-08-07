import React, { useState } from "react";
import { Row, Col, ListGroup } from "react-bootstrap";

import { CampaignStorageService } from "../../CampaignStorageService";
import { CampaignSettings } from "../../_types";

import { Container } from "./_Container";
import { Encounter, PurchaseItem } from "../../../characters/View/_types";
import FontAwesome from "react-fontawesome";

interface Props {
  service: CampaignStorageService
}

export const View: React.FC<Props> = ({ service }) => (
  <Container service={service}>
    {(settings) => (
      <ViewSettings settings={settings} />
    )}
  </Container>
);

interface SettingsProps {
  settings: CampaignSettings
}
const ViewSettings: React.FC<SettingsProps> = ({ settings }) => {

  return (
      <ListGroup id="campaign-settings" variant="flush">
        <ListHeader />
        <EncounterGroup title="Encounters" encounters={settings.encounters} defaultActive />
        <ItemGroup title="Achievements" items={settings.achievements} />
        <ItemGroup title="Recovery & Improvement" items={settings.restsAndImprovements} />
        <ItemGroup title="Potions" items={settings.potions} />
        <ItemGroup title="Weapons" items={settings.weapons} />
        <ItemGroup title="Armor" items={settings.armor} />
        <ItemGroup title="Magic" items={settings.magic} />
      </ListGroup>
  );
};

const ListHeader: React.FC = () => (
  <ListGroup.Item>
    <Row>
      <Col>
        <strong>Tier</strong>
      </Col>
      <Col sm={6}>
        <strong>Setting</strong>
      </Col>
      <Col className="text-right">
        <strong>Points</strong>
      </Col>
    </Row>
  </ListGroup.Item>
);

interface EncounterGroupProps {
  title: string,
  encounters: Encounter[],
  defaultActive?: boolean
}

const EncounterGroup: React.FC<EncounterGroupProps> = ({ title, encounters, defaultActive = false }) => {
  const [isActive, setIsActive] = useState(defaultActive);

  const chevronDirection = isActive ? "up" : "down";
  const onClick = () => {
    setIsActive(!isActive);
  }
  return (
    <>
      <ListGroup.Item action onClick={onClick}>
        {title}
        <FontAwesome className="pull-right" name={`chevron-${chevronDirection}`} />
      </ListGroup.Item>
      {isActive && encounters.map(e => (
        <SettingEncounter key={e.level} encounter={e} />
      ))}
    </>
  );
};

interface SettingEncounterProps {
  encounter: Encounter
}

const SettingEncounter: React.FC<SettingEncounterProps> = ({ encounter }) => {
  let symbol = "";
  if(encounter.points > 0) symbol = "+";
  if(encounter.points < 0) symbol = "-";
  const amount = encounter.points * (encounter.points < 0 ? -1 : 1);

  return (
    <ListGroup.Item>
      <Row>
        <Col>{encounter.tier}</Col>
        <Col sm={6}>{`Encounter ${encounter.level}`}</Col>
        <Col className="text-right">{symbol} {amount}</Col>
      </Row>
    </ListGroup.Item>
  );
};

interface ItemGroupProps {
  title: string,
  items: PurchaseItem[],
  defaultActive?: boolean
}

const ItemGroup: React.FC<ItemGroupProps> = ({ title, items, defaultActive = false }) => {
  const [isActive, setIsActive] = useState(defaultActive);

  const chevronDirection = isActive ? "up" : "down";
  const onClick = () => {
    setIsActive(!isActive);
  }

  return (
    <>
      <ListGroup.Item action onClick={onClick}>
        {title}
        <FontAwesome className="pull-right" name={`chevron-${chevronDirection}`} />
      </ListGroup.Item>
      {isActive && items.map(i => (
        <SettingItem key={i.key} item={i} />
      ))}
    </>
  );
};

interface SettingItemProps {
  item: PurchaseItem
}

const SettingItem: React.FC<SettingItemProps> = ({ item }) => {
  let symbol = "";
  if(item.points > 0) symbol = "+";
  if(item.points < 0) symbol = "-";
  const amount = item.points * (item.points < 0 ? -1 : 1);

  return (
    <ListGroup.Item>
      <Row>
        <Col>{item.tier || "Any"}</Col>
        <Col sm={6}>{item.description}</Col>
        <Col className="text-right">{symbol} {amount}</Col>
      </Row>
    </ListGroup.Item>
  );
};
