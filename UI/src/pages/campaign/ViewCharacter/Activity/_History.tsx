import React, { useState, useEffect } from "react";
import { ListGroup, ListGroupItem, Button, Accordion, Card } from "react-bootstrap";

import { HistoryItem, HistoryLevel, HistoryTier } from "./_types";
import { Encounter, PurchasedItem } from "../../../../types";

interface Props {
  history: HistoryTier[],
  activeEncounter: Encounter,
  setEncounter?: (encounter: Encounter) => void
  onDelete?: (item: PurchasedItem) => void 
}
export const History: React.FC<Props> = ({ history, activeEncounter, ...rest }) => {
  const [activeTier, setActiveTier] = useState<number>(activeEncounter.tier);

  useEffect(() => {
    setActiveTier(activeEncounter.tier);
  }, [activeEncounter]);

  return (
    <div id="character-history">
      <Card>
        <Card.Body className="pb-0">
          <h5 className="card-title">History</h5>
        </Card.Body>
        <Accordion activeKey={`tier-${activeTier}`}>
            {history.map((tier, i) => {
              const key = `tier-${i+1}`;
              const onClick = () => {
                setActiveTier(tier.tier);
              };

              return (
                <Tier key={key} eventKey={key} tier={tier} onClick={onClick} {...rest} />
              );
            })}
          </Accordion>
      </Card>
    </div>
  );
};

interface TierProps {
  eventKey: string,
  tier: HistoryTier,
  onClick?: () => void
}
const Tier: React.FC<TierProps> = ({ eventKey, tier, onClick, ...rest }) => {
  return (
    <Card>
      <Accordion.Toggle as={Card.Header} variant="link" eventKey={eventKey} onClick={onClick} className="history-section-toggle">
        Tier {tier.tier}
      </Accordion.Toggle>
      <Accordion.Collapse eventKey={eventKey}>
        <ListGroup variant="flush">
          {tier.levels.map(level => (
              <Level key={`level-${level.level}`} level={level} {...rest} />
          ))}
        </ListGroup>
      </Accordion.Collapse>
    </Card>
  );
};

interface LevelProps {
  level: HistoryLevel,
  setEncounter?: Props["setEncounter"]
}
const Level: React.FC<LevelProps> = ({ level, setEncounter, ...rest }) => {
  const onClick = () => {
    // console.log("level change clicked...", level);
    if(!setEncounter) return;
    setEncounter(level.encounter);
  };
  return (
    <ListGroupItem>
      <div className="encounter-header mb-1" onClick={onClick}>Encounter {level.level}</div>
      {level.items.map(item => (
          <Item key={item.id} item={item} {...rest} />
      ))}
    </ListGroupItem>
  );
};

interface ItemProps {
  item: HistoryItem,
  onDelete?: (item: PurchasedItem) => void  
}
const Item: React.FC<ItemProps> = ({ item, onDelete }) => {
  const deleteItem = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => { 
    if(!onDelete) return;
    onDelete(item);
   };

  let symbol = "";
  if (item.points > 0) symbol = "+";
  if (item.points < 0) symbol = "-";
  const amount = item.points < 0 ? item.points * -1 : item.points;
  
  return (
    <div className="row pt-1">
      <div className="col-8 pl-4">
        {item.description}
        <Button variant="outline-danger" title="remove" size="sm" className="float-right" onClick={deleteItem}><small>remove</small></Button>
      </div>
      <div className="col text-right pr-2">
        <span className="float-left">{symbol}</span>{amount}
      </div>
      <div className="col text-right pl-2">{item.balance + item.points}</div>
    </div>
  );
};
