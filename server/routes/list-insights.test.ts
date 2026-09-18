import { Application, Router } from "@oak/oak";
import { expect } from "@std/expect";
import { beforeAll, describe, it } from "@std/testing/bdd";
import { withDB } from "$testing";
import { registerListInsightsRoute } from "./list-insights.ts";

describe("GET /insights", () => {
  describe("with an empty database", () => {
    withDB((fixture) => {
      const app = new Application();
      const router = new Router();
      registerListInsightsRoute(router, fixture.db);
      app.use(router.routes());
      app.use(router.allowedMethods());

      it("returns an empty list", async () => {
        const response = await app.handle(new Request(new URL("/insights", import.meta.url)));
        if (!response) throw new Error("Oak did not respond");

        expect(response.status).toBe(200);
        expect(await response.json()).toEqual([]);
      });
    });
  });

  describe("with saved insights", () => {
    withDB((fixture) => {
      const app = new Application();
      const router = new Router();
      registerListInsightsRoute(router, fixture.db);
      app.use(router.routes());
      app.use(router.allowedMethods());

      beforeAll(() => {
        fixture.insights.insert([
          { brand: 2, createdAt: "2026-01-01T00:00:00.000Z", text: "First insight" },
          { brand: 3, createdAt: "2026-01-02T00:00:00.000Z", text: "Second insight" },
        ]);
      });

      it("returns all insights as JSON", async () => {
        const response = await app.handle(new Request(new URL("/insights", import.meta.url)));
        if (!response) throw new Error("Oak did not respond");

        expect(response.status).toBe(200);
        expect(await response.json()).toEqual([
          { id: 1, brand: 2, createdAt: "2026-01-01T00:00:00.000Z", text: "First insight" },
          { id: 2, brand: 3, createdAt: "2026-01-02T00:00:00.000Z", text: "Second insight" },
        ]);
      });
    });
  });
});
