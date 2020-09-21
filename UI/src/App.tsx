import React from "react";
import { Router } from "react-router";
import { Route, Switch } from "react-router-dom";
import { History } from "history";

import { Header } from "./components/Header";
import { Home } from "./pages/Home";

import { CreateCampaign, JoinCampaign, ViewCampaign, CampaignsList, ViewCharacter, ViewDmPage } from "./pages/campaign";
import { NotFound } from "./pages/errors";

interface Props {
  title: string,
  history: History
}

const App: React.FC<Props> = ({title, history}) => (
  <div className="App">
    <Router history={history}>
      <Header title={title} />
      <Switch>
        {/* Home */}
        <Route exact path="/" component={Home} />

        {/* Campaign Pages */}
        <Route exact path="/campaign/create" component={CreateCampaign} />
        <Route exact path="/campaign/" component={CampaignsList} />
        <Route exact path="/campaign/:id" component={ViewCampaign} />
        <Route exact path="/campaign/:id/join" component={JoinCampaign} />
        <Route exact path="/campaign/:id/dm-controls" component={ViewDmPage} />
        <Route exact path="/campaign/:campaignId/character/:characterId" component={ViewCharacter} />

        {/* Errors */}
        <Route component={NotFound} />
      </Switch>
    </Router>
  </div>  
);

export default App;
