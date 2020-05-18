import React from "react";

import { AppState, SetEncounter, OnPurchase, OnRemove } from "./_types";
import { CharacterProfile } from "./_Profile";
import { LevelControl } from "./_LevelControl";
import { History } from "./_History";
import { PurchaseBlock } from "./_PurchaseBlock";

interface Props {
  saving: boolean,
  app: AppState,
  setEncounter?: SetEncounter,
  onPurchase?: OnPurchase,
  onRemove?: OnRemove
}

export const ViewCharacter: React.FC<Props> = ({ saving, app, setEncounter, onPurchase, onRemove }) => {

  return (
  <div className="container">
    {/* General Info Block */}
    <div className="row">
      <div className="col-6">
        {/* Character Block */}
        <CharacterProfile profile={app.profile} />
      </div>
      <div className="col-6 text-right">
        <LevelControl activeEncounter={app.activeEncounter} encounters={app.encounters} onChange={setEncounter} />
      </div>
    </div>

    <div className="row">
      {/* History Block */}
      <div className="col-7">
        <History history={app.history} activeEncounter={app.activeEncounter} setEncounter={setEncounter} onDelete={onRemove} />
      </div>

      {/* Purchasing Block */}
      <div className="col-5">
        <PurchaseBlock app={app} onPurchase={onPurchase} />
      </div>
    </div>
  </div>
  );
};
