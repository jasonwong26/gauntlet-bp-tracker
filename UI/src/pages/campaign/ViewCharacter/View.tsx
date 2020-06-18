import React from "react";
import { AppState, SetEncounter, OnPurchase, OnRemove } from "../../characters/View/_types";
import * as App from "../../characters/View/View";


interface Props {
  app: AppState, 
  setEncounter?: SetEncounter, 
  onPurchase?: OnPurchase, 
  onRemove?: OnRemove
}

export const ViewCharacter: React.FC<Props> = ({ app, setEncounter, onPurchase, onRemove }) => {
  return (
    <App.ViewCharacter saving={false} app={app} setEncounter={setEncounter} onPurchase={onPurchase} onRemove={onRemove} />
  );
};

