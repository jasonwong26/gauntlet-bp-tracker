import React, { useState } from "react";
import FontAwesome from "react-fontawesome";
import { ListGroup, ListGroupItem, Button, Form, Badge } from "react-bootstrap";

import { PurchaseItem } from "../../../../types";
import { AppState } from "./_types";

interface Props {
  app: AppState,
  saving?: boolean
  onPurchase?: (item: PurchaseItem) => void
}
export const PurchaseBlock: React.FC<Props> = ({app, saving, onPurchase}) => {
  return (
    <div className="card">
      <div className="card-body">
        <h5 className="card-title">
          <span className="mr-2">Manage BP</span>
          {!!saving && <FontAwesome name="spinner" spin />}
         <Badge variant="secondary" className="float-right">{app.balance} BP</Badge></h5>    
        {app.purchaseBlocks.map(block => (
          <PurchaseGroup key={block.key} title={block.title} defaultActive={block.defaultActive} balance={app.balance} items={block.items} onPurchase={onPurchase} />
        ))}
        <PurchaseCustom balance={app.balance} onPurchase={onPurchase} />
      </div>
    </div>
  );
};

interface GroupProps {
  title: string
  balance: number,
  items: PurchaseItem[]
  defaultActive?: boolean
  onPurchase?: (item: PurchaseItem) => void
}
const PurchaseGroup: React.FC<GroupProps> = ({ title, items, balance, defaultActive = false, onPurchase}) => {
  return (
    <PurchaseContainer title={title} defaultActive={defaultActive}>
      <ListGroup variant="flush">
        {items.map(item => (
          <Item key={item.key} item={item} balance={balance} onPurchase={onPurchase} />
        ))}
      </ListGroup>
    </PurchaseContainer>
  );
};

interface ItemProps {
  item: PurchaseItem
  balance: number,
  onPurchase?: (item: PurchaseItem) => void  
}
const Item: React.FC<ItemProps> = ({ item, balance, onPurchase }) => {
  const purchaseItem = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => { 
    if(!onPurchase) return;
    onPurchase(item);
   };

   const disabled = (balance + item.points) < 0;
   const variant = item.points > 0 ? "outline-success" : "outline-danger";
   const symbol = item.points > 0 ? "+" : "";

   return (
      <ListGroupItem key={item.key}>{item.description} 
        <Button variant={variant}
                size="sm"
                className="float-right" 
                disabled={disabled}
                onClick={purchaseItem} 
                >{symbol}{item.points}</Button>
      </ListGroupItem>     
   );
};

interface ContainerProps {
  title: string
  defaultActive?: boolean
}
const PurchaseContainer: React.FC<ContainerProps> = ({title, defaultActive, children}) => {
  const [isActive, setIsActive] = useState(defaultActive);

  const activeClass = isActive ? "active" : "";
  const buttonVariant = isActive ? "info" : "dark";
  const chevronDirection = isActive ? "up" : "down";

  const toggleIsActive = () => { setIsActive(!isActive); };

  return (
    <div className={`purchase-block ${activeClass}`}>
      <Button variant={buttonVariant} block className="text-left" onClick={toggleIsActive}>
        <span>{title}</span>               
        <FontAwesome name={`chevron-${chevronDirection}`} className="float-right" />
      </Button>              
      {isActive && (
        <>{children}</>
      )}
    </div>
  );
};

interface CustomProps {
  balance: number,
  defaultActive?: boolean
  onPurchase?: (item: PurchaseItem) => void
}
const PurchaseCustom: React.FC<CustomProps> = ({ balance, defaultActive = false, onPurchase }) => {
  const [description, setDescription] = useState("");
  const [pointsInput, setPointsInput] = useState("");

  const points: number = pointsInput ? Number(pointsInput) : 0;
  const allowSubmit = description && !!points && (balance + points > 0);
  const btnSymbol = points < 0 ? "" : "+";
  const btnVariant = points < 0 ? "outline-danger" : "outline-success";

  const updateDescription: React.ChangeEventHandler<HTMLInputElement> = event => {
    const value = event.target.value;
    if(value.length > 100) return;
    setDescription(value);
  };
  const updatePoints: React.ChangeEventHandler<HTMLInputElement> = event => {
    const value = event.target.value;
    const asPoints = value ? Number(value) : 0;
    if(!Number.isInteger(asPoints) || asPoints < -10000 || asPoints > 10000) return;
    setPointsInput(value);
  };
  const onSubmit: React.FormEventHandler<HTMLFormElement> = event => {
    event.preventDefault();
    if(!allowSubmit || !onPurchase) return;

    const item: PurchaseItem = {
      key: "custom",
      description,
      points
    };
    onPurchase(item);
    resetForm();
  };
  const resetForm = () => {
    setDescription("");
    setPointsInput("");
  };

  return (
    <PurchaseContainer title="Custom" defaultActive={defaultActive}>
      <Form className="custom-item-form mt-2" onSubmit={onSubmit}>
        <Form.Group>
          <Form.Label>Description</Form.Label>
          <Form.Control required type="text" value={description} onChange={updateDescription} />
        </Form.Group>

        <Form.Group>
          <Form.Label>Points</Form.Label>
          <Form.Control required type="number" step="1" min="-10000" max="10000" value={pointsInput} onChange={updatePoints} />
        </Form.Group>

        <Button variant={btnVariant}
                type="submit"
                size="sm"
                disabled={!allowSubmit}
                className="float-right">{`${btnSymbol}${points}`}</Button>
      </Form>
    </PurchaseContainer>
  );
};
