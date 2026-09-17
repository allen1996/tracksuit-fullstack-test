import { describe, expect, it } from "vitest";
import { Button } from "$components/button/button.tsx";
import { render } from "@testing-library/react";

describe("button", () => {
  it("renders", () => {
    const { getByText } = render(<Button label="Test" />);
    expect(getByText("Test")).toBeTruthy();
  });
});
