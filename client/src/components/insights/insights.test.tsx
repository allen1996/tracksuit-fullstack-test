import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { Insights } from "$components/insights/insights.tsx";
import type { Insight } from "$schemas/insight.ts";

const TEST_INSIGHTS: Insight[] = [
  {
    id: 1,
    brand: 1,
    createdAt: new Date(),
    text: "Test insight",
  },
  { id: 2, brand: 2, createdAt: new Date(), text: "Another test insight" },
];

describe("insights", () => {
  it("renders", () => {
    const { getByText } = render(<Insights insights={TEST_INSIGHTS} />);
    expect(getByText(TEST_INSIGHTS[0].text)).toBeTruthy();
  });
});
