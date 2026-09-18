import { Application, Router } from "@oak/oak";
import { expect } from "@std/expect";
import { beforeAll, describe, it } from "@std/testing/bdd";
import { withDB } from "$server-utils/testing.ts";
import { registerDeleteInsightRoute } from "./delete-insight.ts";

describe("DELETE /insights/:id", () => {
  withDB((fixture) => {
    const app = new Application();
    const router = new Router();
    registerDeleteInsightRoute(router, fixture.db);
    app.use(router.routes());
    app.use(router.allowedMethods());

    beforeAll(() => {
      fixture.insights.insert([
        { brand: 1, createdAt: "2026-01-01T00:00:00.000Z", text: "Delete me" },
        { brand: 2, createdAt: "2026-01-02T00:00:00.000Z", text: "Keep me" },
      ]);
    });

    const remove = async (id: string): Promise<Response> => {
      const response = await app.handle(
        new Request(new URL(`/insights/${id}`, import.meta.url), {
          method: "DELETE",
        }),
      );
      if (!response) throw new Error("Oak did not respond");
      return response;
    };

    it("deletes the requested insight and returns 204", async () => {
      const response = await remove("1");

      expect(response.status).toBe(204);
      expect(await response.text()).toBe("");
      expect(fixture.insights.selectAll()).toEqual([{
        id: 2,
        brand: 2,
        createdAt: "2026-01-02T00:00:00.000Z",
        text: "Keep me",
      }]);
    });

    it("returns an error when the insight does not exist", async () => {
      const rowsBefore = fixture.insights.selectAll();
      const response = await remove("99");

      expect(response.status).toBe(400);
      expect(await response.json()).toEqual({ error: "Insight not found" });
      expect(fixture.insights.selectAll()).toEqual(rowsBefore);
    });

    for (const id of ["0", "abc", "1.5", "-1"]) {
      it(`returns 400 for invalid ID ${id}`, async () => {
        const rowsBefore = fixture.insights.selectAll();
        const response = await remove(id);

        expect(response.status).toBe(400);
        expect(await response.json()).toEqual({ error: "Invalid insight ID" });
        expect(fixture.insights.selectAll()).toEqual(rowsBefore);
      });
    }
  });
});
