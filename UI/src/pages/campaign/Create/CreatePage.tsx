import * as React from "react";

import { Container } from "./_Container";
import { CreateCampaign } from "./Create";

export const CreatePage: React.FC = () => {
  return (
    <div className="container">
      <Container>
        {(saving, onUpdate, onCreate, campaign) => (
          <CreateCampaign campaign={campaign} saving={saving} onUpdate={onUpdate} onCreate={onCreate} />
        )}
      </Container>
    </div>
  );
};
