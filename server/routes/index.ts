import type { Database } from "@db/sqlite";
import type { Router } from "@oak/oak";
import { registerCreateInsightRoute } from "./create-insight.ts";
import { registerDeleteInsightRoute } from "./delete-insight.ts";
import { registerHealthRoute } from "./health.ts";
import { registerListInsightsRoute } from "./list-insights.ts";
import { registerLookupInsightRoute } from "./lookup-insight.ts";

export function registerRoutes(router: Router, db: Database): void {
  registerHealthRoute(router);
  registerListInsightsRoute(router, db);
  registerCreateInsightRoute(router, db);
  registerDeleteInsightRoute(router, db);
  registerLookupInsightRoute(router, db);
}
