import React from "react";
import { createHashHistory } from "history";
import { render } from "@testing-library/react";
import App from "./App";

const history = createHashHistory();

test("renders with placeholder", () => {
  const { getByText } = render(<App history={history} />);
  const linkElement = getByText(/This is a placeholder./i);
  expect(linkElement).toBeInTheDocument();
});
