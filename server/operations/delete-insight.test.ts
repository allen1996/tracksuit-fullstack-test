import { expect } from "@std/expect";
import { describe, it } from "@std/testing/bdd";
import { withDB } from "$server-utils/testing.ts";
import deleteInsight from "$operations/delete-insight.ts";

describe("deleting an insight", () => {
  withDB((fixture) => {
    it("deletes an existing insight", () => {
      fixture.insights.insert([{
        brand: 1,
        createdAt: new Date().toISOString(),
        text: "An insight",
      }]);

      expect(deleteInsight({ ...fixture, id: 1 })).toBe(true);
      expect(fixture.insights.selectAll()).toEqual([]);
    });

    it("return false when the insight does not exist", () => {
      expect(deleteInsight({ ...fixture, id: 999 })).toBe(false);
    });
  });
});
