import type { Database } from "@db/sqlite";
import type { Router } from "@oak/oak";
import listInsights from "$operations/list-insights.ts";

export function registerListInsightsRoute(router: Router, db: Database): void {
  router.get("/insights", (ctx) => {
    ctx.response.body = listInsights({ db });
    ctx.response.status = 200;
  });
}
