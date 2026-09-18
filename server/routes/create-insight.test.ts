import { Application, Router } from "@oak/oak";
import { expect } from "@std/expect";
import { describe, it } from "@std/testing/bdd";
import { withDB } from "$server-utils/testing.ts";
import { registerCreateInsightRoute } from "./create-insight.ts";

describe("POST /insights/create", () => {
  withDB((fixture) => {
    const app = new Application();
    const router = new Router();
    registerCreateInsightRoute(router, fixture.db);
    app.use(router.routes());
    app.use(router.allowedMethods());

    const post = async (body?: string): Promise<Response> => {
      const response = await app.handle(
        new Request(new URL("/insights/create", import.meta.url), {
          method: "POST",
          headers: { "content-type": "application/json" },
          body,
        }),
      );
      if (!response) throw new Error("Oak did not respond");
      return response;
    };

    it("creates and returns an insight", async () => {
      const response = await post(JSON.stringify({ brand: 2, text: "A new insight" }));
      expect(response.status).toBe(201);

      const insight = await response.json();
      expect(insight).toEqual({
        id: 1,
        brand: 2,
        createdAt: expect.any(String),
        text: "A new insight",
      });
      expect(new Date(insight.createdAt).toISOString()).toBe(insight.createdAt);
      expect(fixture.insights.selectAll()).toEqual([insight]);
    });

    for (
      const [name, body] of [
        ["missing body", undefined],
        ["malformed JSON", "{"],
        ["invalid brand", JSON.stringify({ brand: -1, text: "An insight" })],
        ["missing text", JSON.stringify({ brand: 2 })],
      ] as const
    ) {
      it(`returns 400 for ${name}`, async () => {
        const rowsBefore = fixture.insights.selectAll();
        const response = await post(body);

        expect(response.status).toBe(400);
        expect(await response.json()).toEqual({ error: "Invalid insight" });
        expect(fixture.insights.selectAll()).toEqual(rowsBefore);
      });
    }
  });
});
