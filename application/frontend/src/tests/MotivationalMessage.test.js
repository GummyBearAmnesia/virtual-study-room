import React from "react";
import { render } from "@testing-library/react";
import MotivationalMessage from "../pages/Motivation";

describe("Motivational Message", () => {
  it("shows up correctly"),
    () => {
      render(<MotivationalMessage />);
    };
});
