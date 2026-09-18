import { expect } from "@std/expect";
import { describe, it } from "@std/testing/bdd";
import { withDB } from "$server-utils/testing.ts";
import createInsight from "$operations/create-insight.ts";

describe("creating an insight", () => {
  withDB((fixture) => {
    it("inserts and returns the created insight", () => {
      const createdAt = new Date("2026-09-18T04:00:00.000Z");

      const result = createInsight({
        ...fixture,
        brand: 2,
        createdAt,
        text: "Brand 2 Text.",
      });

      expect(result).toEqual({
        id: 1,
        brand: 2,
        createdAt,
        text: "Brand 2 Text.",
      });
      expect(fixture.insights.selectAll()).toEqual([{
        id: 1,
        brand: 2,
        createdAt: createdAt.toISOString(),
        text: "Brand 2 Text.",
      }]);
    });
  });
});
