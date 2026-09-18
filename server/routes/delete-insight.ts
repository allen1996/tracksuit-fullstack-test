import type { Router } from "@oak/oak";

export function registerDeleteInsightRoute(router: Router): void {
  router.get("/insights/delete", (_ctx) => {
    // TODO
  });
}
