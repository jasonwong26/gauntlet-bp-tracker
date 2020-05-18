import React from "react";
import { Router } from "react-router";
import { Route, Switch } from "react-router-dom";
import { History } from "history";

import { Header } from "./components/Header";
import { Home } from "./pages/Home";

import { CreateCampaign, ViewCampaign} from "./pages/campaign";
import { CreatePage, ListPage, ViewPage } from "./pages/characters";
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
        <Route exact path="/campaign/:id" component={ViewCampaign} />

        {/* Character Pages */}
        <Route exact path="/character" component={ListPage} />
        <Route exact path="/character/create" component={CreatePage} />
        <Route exact path="/character/:id" component={ViewPage} />

        {/* Errors */}
        <Route component={NotFound} />
      </Switch>
    </Router>
  </div>  
);

export default App;
