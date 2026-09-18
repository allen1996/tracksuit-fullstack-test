import type { Router } from "@oak/oak";
import type { Database } from "@db/sqlite";
import lookupInsight from "$operations/lookup-insight.ts";
import { z } from "zod";

const InsightId = z.coerce.number().int().positive().safe();

export function registerLookupInsightRoute(router: Router, db: Database): void {
  router.get("/insights/:id", (ctx) => {
    const parsedId = InsightId.safeParse(ctx.params.id);

    if (!parsedId.success) {
      ctx.response.status = 400;
      ctx.response.body = { error: "Invalid insight ID" };
      return;
    }

    const insight = lookupInsight({ db, id: parsedId.data });
    if (!insight) {
      ctx.response.status = 404;
      ctx.response.body = { error: "Insight not found" };
      return;
    }

    ctx.response.status = 200;
    ctx.response.body = insight;
  });
}
