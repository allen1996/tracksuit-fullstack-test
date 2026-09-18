import type { Router } from "@oak/oak";
import type { Database } from "@db/sqlite";
import { CreateInsight } from "$models/insight.ts";
import createInsight from "$operations/create-insight.ts";

export function registerCreateInsightRoute(router: Router, db: Database): void {
  router.post("/insights/create", async (ctx) => {
    const body = await ctx.request.body.json().catch(() => undefined);
    const input = CreateInsight.safeParse(body);
    if (!input.success) {
      ctx.response.status = 400;
      ctx.response.body = { error: "Invalid insight" };
      return;
    }

    ctx.response.body = createInsight({ db, ...input.data });
    // status can be either 201 or 200 depending on team convention
    ctx.response.status = 201;
  });
}
