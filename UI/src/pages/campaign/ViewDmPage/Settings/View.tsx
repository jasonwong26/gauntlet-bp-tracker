import React, { useState } from "react";
import { Row, Col, ListGroup, Form } from "react-bootstrap";
import OutsideClickHandler from "react-outside-click-handler";

import { CampaignStorageService2 } from "../../CampaignStorageService2";
import { CampaignSettings } from "../../_types";

import { Container } from "./_Container";
import { Encounter, PurchaseItem } from "../../../characters/View/_types";
import FontAwesome from "react-fontawesome";
import { TransactionStatus } from "../../../../shared/TransactionStatus";
import { BadgeByState } from "../../../../components/Badge";

interface Props {
  service: CampaignStorageService2
}

export const View: React.FC<Props> = ({ service }) => (
  <Container service={service}>
    {(settings, saving, onSave) => (
      <ViewSettings settings={settings} saving={saving} onSave={onSave} />
    )}
  </Container>
);

interface SettingsProps {
  settings: CampaignSettings,
  saving: TransactionStatus,
  onSave?: (settings: CampaignSettings) => void;
}
const ViewSettings: React.FC<SettingsProps> = ({ settings, saving, onSave }) => {

  const onEncountersChange = (encounters: Encounter[]) => {
    if(!onSave) return;

    const newSettings = { ...settings, encounters };
    onSave(newSettings);
  };

  const onItemsChange = (key: string, items: PurchaseItem[]) => {
    if(!onSave) return;

    const newSettings = { ...settings, [key]: items };
    onSave(newSettings);
  };

  const onAchievementsChange = (items: PurchaseItem[]) => {
    onItemsChange("achievements", items);
  };
  const onRestsChange = (items: PurchaseItem[]) => {
    onItemsChange("restsAndImprovements", items);
  };
  const onPotionsChange = (items: PurchaseItem[]) => {
    onItemsChange("potions", items);
  };
  const onWeaponsChange = (items: PurchaseItem[]) => {
    onItemsChange("weapons", items);
  };
  const onArmorChange = (items: PurchaseItem[]) => {
    onItemsChange("armor", items);
  };
  const onMagicChange = (items: PurchaseItem[]) => {
    onItemsChange("magic", items);
  };

  return (
    <>
      <SavingDisplay saving={saving} />
      <ListGroup id="campaign-settings" variant="flush">
        <ListHeader />
        <EncounterGroup title="Encounters" encounters={settings.encounters} defaultActive onEncountersChange={onEncountersChange} />
        <ItemGroup title="Achievements" items={settings.achievements} onItemsChange={onAchievementsChange} />
        <ItemGroup title="Recovery & Improvement" items={settings.restsAndImprovements} onItemsChange={onRestsChange} />
        <ItemGroup title="Potions" items={settings.potions} onItemsChange={onPotionsChange} />
        <ItemGroup title="Weapons" items={settings.weapons} onItemsChange={onWeaponsChange} />
        <ItemGroup title="Armor" items={settings.armor} onItemsChange={onArmorChange} />
        <ItemGroup title="Magic" items={settings.magic} onItemsChange={onMagicChange} />
      </ListGroup>
    </>
  );
};

interface SavingDisplayProps {
  saving: TransactionStatus
}

const SavingDisplay: React.FC<SavingDisplayProps> = ({ saving }) => (
  <Row>
    <Col className="text-right mb-2">
    <BadgeByState className="text-left" status={saving} icon="refresh" />
    </Col>
  </Row>
);

const ListHeader: React.FC = () => (
  <ListGroup.Item className="list-group-header">
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
  onEncountersChange?: (encounters: Encounter[]) => void
}

const EncounterGroup: React.FC<EncounterGroupProps> = ({ title, encounters, defaultActive = false, onEncountersChange }) => {
  const [isActive, setIsActive] = useState(defaultActive);

  const chevronDirection = isActive ? "up" : "down";
  const onClick = () => {
    setIsActive(!isActive);
  };

  const onEncounterChange = (encounter: Encounter) => {
    if(!onEncountersChange) return;

    const index = encounters.findIndex(e => e.level === encounter.level);
    const updated = [...encounters];
    updated.splice(index, 1, encounter);
    onEncountersChange(updated);
  };

  return (
    <>
      <ListGroup.Item action onClick={onClick}>
        {title}
        <FontAwesome className="pull-right" name={`chevron-${chevronDirection}`} />
      </ListGroup.Item>
      {isActive && encounters.map(e => (
        <SettingEncounter key={e.level} encounter={e} onEdit={onEncounterChange} />
      ))}
    </>
  );
};

interface SettingEncounterProps {
  encounter: Encounter
  onEdit: (encounter: Encounter) => void
}

const SettingEncounter: React.FC<SettingEncounterProps> = ({ encounter, onEdit }) => {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [points, setPoints] = useState<number>(encounter.points);

  const onOutsideClick = () => {
    setIsEditing(false);
  };
  const onClick = () => {
    if(!isEditing) {
      setIsEditing(true);
    }
  };

  const onSubmit = (encounter: Encounter) => {
    setPoints(encounter.points);
    onEdit(encounter);
    setIsEditing(false);    
  };

  let symbol = "";
  if(points > 0) symbol = "+";
  if(points < 0) symbol = "-";
  const amount = points * (points < 0 ? -1 : 1);

  return (
    <ListGroup.Item action>
      <OutsideClickHandler onOutsideClick={onOutsideClick}>
        <Row onClick={onClick}>
            { !isEditing && (
              <>
                <Col>{encounter.tier}</Col>
                <Col sm={6}>{`Encounter ${encounter.level}`}</Col>
                <Col className="text-right"><span>{symbol} {amount}</span></Col>
              </>
            )}
            { !!isEditing && (
              <SettingEncounterForm encounter={encounter} onEdit={onSubmit} />
            )}
        </Row>
      </OutsideClickHandler>
    </ListGroup.Item>
  );
};

const SettingEncounterForm: React.FC<SettingEncounterProps> = ({ encounter, onEdit }) => {
  const [pointsInput, setPointsInput] = useState(encounter.points.toString());

  const updatePoints: React.ChangeEventHandler<HTMLInputElement> = event => {
    const value = event.target.value;
    const asPoints = !!value ? Number(value) : 0;
    if(!Number.isInteger(asPoints) || asPoints < -10000 || asPoints > 10000) return;
    setPointsInput(value);
  };

  const onKeyUp = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if( event.key !== "Enter") return;
    onSubmit();
  };
  const onSubmit = () => {
    const points: number = !!pointsInput ? Number(pointsInput) : 0;
    const allowSubmit = !!points && points !== encounter.points;
    
    if(!allowSubmit) return;

    const updated = {...encounter, points };
    onEdit(updated);   
  };

  return (
    <Form className="settings-form" inline>
      <Col>
        <Form.Label htmlFor="encounter-tier" srOnly>Tier</Form.Label>
        <Form.Control id="encounter-tier" plaintext readOnly defaultValue={encounter.tier} />  
      </Col>
      <Col sm={6}>
        <Form.Label htmlFor="encounter-description" srOnly>Description</Form.Label>
        <Form.Control id="encounter-description" plaintext readOnly defaultValue={`Encounter ${encounter.level}`} />  
      </Col>
      <Col className="text-right" >
        <OutsideClickHandler onOutsideClick={onSubmit}>
          <Form.Label htmlFor="encounter-points" srOnly>Points</Form.Label>
          <Form.Control id="encounter-points" className="text-right" required type="number" step="1" min="-10000" max="10000" value={pointsInput} onChange={updatePoints} onKeyUp={onKeyUp} />
        </OutsideClickHandler>
      </Col>
    </Form>
  );
};

interface ItemGroupProps {
  title: string,
  items: PurchaseItem[],
  defaultActive?: boolean,
  onItemsChange?: (items: PurchaseItem[]) => void
}

const ItemGroup: React.FC<ItemGroupProps> = ({ title, items, defaultActive = false, onItemsChange }) => {
  const [isActive, setIsActive] = useState(defaultActive);

  const chevronDirection = isActive ? "up" : "down";
  const onClick = () => {
    setIsActive(!isActive);
  };

  const onItemChange = (item: PurchaseItem) => {
    if(!onItemsChange) return;

    const index = items.findIndex(i => i.key === item.key);
    const updated = [...items];
    updated.splice(index, 1, item);
    onItemsChange(updated);
  };

  return (
    <>
      <ListGroup.Item action onClick={onClick}>
        {title}
        <FontAwesome className="pull-right" name={`chevron-${chevronDirection}`} />
      </ListGroup.Item>
      {isActive && items.map(i => (
        <SettingItem key={i.key} item={i} onEdit={onItemChange} />
      ))}
    </>
  );
};

interface SettingItemProps {
  item: PurchaseItem
  onEdit: (item: PurchaseItem) => void
}

const SettingItem: React.FC<SettingItemProps> = ({ item, onEdit }) => {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [points, setPoints] = useState<number>(item.points);

  const onOutsideClick = () => {
    setIsEditing(false);
  };
  const onClick = () => {
    if(!isEditing) {
      setIsEditing(true);
    }
  };

  const onSubmit = (item: PurchaseItem) => {
    setPoints(item.points);
    onEdit(item);
    setIsEditing(false);    
  };

  let symbol = "";
  if(points > 0) symbol = "+";
  if(points < 0) symbol = "-";
  const amount = points * (points < 0 ? -1 : 1);

  return (
    <ListGroup.Item action>
      <OutsideClickHandler onOutsideClick={onOutsideClick}>
        <Row onClick={onClick}>
          { !isEditing && (
            <>
              <Col>{item.tier || "Any"}</Col>
              <Col sm={6}>{item.description}</Col>
              <Col className="text-right">{symbol} {amount}</Col>
            </>
            )}
            { !!isEditing && (
              <SettingItemForm item={item} onEdit={onSubmit} />
            )}
        </Row>
      </OutsideClickHandler>
    </ListGroup.Item>
  );
};

const SettingItemForm: React.FC<SettingItemProps> = ({ item, onEdit }) => {
  const [pointsInput, setPointsInput] = useState(item.points.toString());

  const updatePoints: React.ChangeEventHandler<HTMLInputElement> = event => {
    const value = event.target.value;
    const asPoints = !!value ? Number(value) : 0;
    if(!Number.isInteger(asPoints) || asPoints < -10000 || asPoints > 10000) return;
    setPointsInput(value);
  };

  const onKeyUp = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if( event.key !== "Enter") return;
    onSubmit();
  };
  const onSubmit = () => {
    const points: number = !!pointsInput ? Number(pointsInput) : 0;
    const allowSubmit = !!points && points !== item.points;
    
    if(!allowSubmit) return;

    const updated = {...item, points };
    onEdit(updated);   
  };

  return (
    <Form className="settings-form" inline>
      <Col>
        <Form.Label htmlFor="item-tier" srOnly>Tier</Form.Label>
        <Form.Control id="item-tier" plaintext readOnly defaultValue={item.tier || "Any"} />  
      </Col>
      <Col sm={6}>
        <Form.Label htmlFor="item-description" srOnly>Description</Form.Label>
        <Form.Control id="item-description" plaintext readOnly defaultValue={item.description} />  
      </Col>
      <Col className="text-right" >
        <OutsideClickHandler onOutsideClick={onSubmit}>
          <Form.Label htmlFor="item-points" srOnly>Points</Form.Label>
          <Form.Control id="item-points" className="text-right" required type="number" step="1" min="-10000" max="10000" value={pointsInput} onChange={updatePoints} onKeyUp={onKeyUp} />
        </OutsideClickHandler>
      </Col>
    </Form>
  );
};