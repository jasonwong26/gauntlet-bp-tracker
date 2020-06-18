import React from "react";
import { Router } from "react-router";
import { Route, Switch } from "react-router-dom";
import { History } from "history";

import { Header } from "./components/Header";
import { Home } from "./pages/Home";

import { JoinCampaign, ViewCampaign, CampaignsList, ViewCharacter } from "./pages/campaign";
import { CreatePage, ListPage, ViewPage } from "./pages/characters";
import { ChatPage } from "./pages/chat/ChatPage";
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
        <Route exact path="/campaign/" component={CampaignsList} />
        <Route exact path="/campaign/:id" component={ViewCampaign} />
        <Route exact path="/campaign/:id/join" component={JoinCampaign} />
        <Route exact path="/campaign/:campaignId/character/:characterId" component={ViewCharacter} />
        
        {/* Character Pages */}
        <Route exact path="/character" component={ListPage} />
        <Route exact path="/character/create" component={CreatePage} />
        <Route exact path="/character/:id" component={ViewPage} />

        {/* Chat Pages */}
        <Route exact path="/chat" component={ChatPage} />

        {/* Errors */}
        <Route component={NotFound} />
      </Switch>
    </Router>
  </div>  
);

export default App;
