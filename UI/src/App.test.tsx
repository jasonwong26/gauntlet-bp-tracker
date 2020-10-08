import React from "react";
import { createHashHistory } from "history";
import { render } from "@testing-library/react";
import App from "./App";

const history = createHashHistory();

test("renders with placeholder", () => {
  const { getByText } = render(<App title="DnD Gauntlet" history={history} />);
  const titleElement = getByText("Welcome");
  expect(titleElement).toBeInTheDocument();
});
