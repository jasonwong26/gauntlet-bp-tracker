import React from "react";
import ReactDOM from "react-dom";
import { createBrowserHistory } from "history";

import "./styles/bootstrap/css/bootstrap-theme-slate-v4.min.css";
import "./styles/styles.css";
import App from "./App";
import * as serviceWorker from "./serviceWorker";
import { initializeAnalytics } from "./utility/Analytics";

const history = createBrowserHistory();
initializeAnalytics(history);

ReactDOM.render(
  <React.StrictMode>
    <App title="DnD Gauntlet" history={history} />
  </React.StrictMode>
  ,
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
