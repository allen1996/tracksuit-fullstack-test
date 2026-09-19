import type { Router } from "@oak/oak";
import type { Database } from "@db/sqlite";
import { InsightId } from "$models/insight.ts";
import deleteInsight from "$operations/delete-insight.ts";

export function registerDeleteInsightRoute(router: Router, db: Database): void {
  router.delete("/insights/:id", (ctx) => {
    const parsedId = InsightId.safeParse(ctx.params.id);

    if (!parsedId.success) {
      ctx.response.status = 400;
      ctx.response.body = { error: "Invalid insight ID" };
      return;
    }

    const hasDeleted = deleteInsight({ db, id: parsedId.data });
    if (!hasDeleted) {
      ctx.response.status = 404;
      ctx.response.body = { error: "Insight not found" };
      return;
    }

    // status can be either 204 or 200 depending on team convention
    ctx.response.status = 204;
  });
}
