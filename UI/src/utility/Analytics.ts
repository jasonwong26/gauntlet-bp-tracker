import ReactGA from "react-ga";
import { History } from "history";

const trackingId = process.env.REACT_APP_ANALYTICS_ID || "";

export const initializeAnalytics: (history: History) => void = history => {
  ReactGA.initialize(trackingId);
  
  history.listen(location => {
    ReactGA.set({ page: location.pathname });                   // Update the user's current page
    ReactGA.pageview(`${location.pathname}${location.search}`); // Record a pageview for the given page
  });
}

export const registerEvent: (category: string, action: string) => void = (category, action) => {
  ReactGA.event({
    category,
    action
  });
}