import { Application, Router } from "@oak/oak";
import { expect } from "@std/expect";
import { beforeAll, describe, it } from "@std/testing/bdd";
import { withDB } from "$server-utils/testing.ts";
import { registerLookupInsightRoute } from "./lookup-insight.ts";

describe("GET /insights/:id", () => {
  withDB((fixture) => {
    const app = new Application();
    const router = new Router();
    registerLookupInsightRoute(router, fixture.db);
    app.use(router.routes());
    app.use(router.allowedMethods());

    beforeAll(() => {
      fixture.insights.insert([{
        brand: 2,
        createdAt: "2026-01-01T00:00:00.000Z",
        text: "A test insight",
      }]);
    });

    const get = async (id: string): Promise<Response> => {
      const response = await app.handle(new Request(new URL(`/insights/${id}`, import.meta.url)));
      if (!response) throw new Error("Oak did not respond");
      return response;
    };

    it("returns an existing insight", async () => {
      const response = await get("1");
      expect(response.status).toBe(200);
      expect(await response.json()).toEqual({
        id: 1,
        brand: 2,
        createdAt: "2026-01-01T00:00:00.000Z",
        text: "A test insight",
      });
    });

    it("returns 404 when the ID does not exist", async () => {
      const response = await get("99");
      expect(response.status).toBe(404);
      expect(await response.json()).toEqual({ error: "Insight not found" });
    });

    for (const id of ["0", "abc", "1.5", "-1"]) {
      it(`returns 400 for invalid ID ${id}`, async () => {
        const response = await get(id);
        expect(response.status).toBe(400);
        expect(await response.json()).toEqual({ error: "Invalid insight ID" });
      });
    }
  });
});
