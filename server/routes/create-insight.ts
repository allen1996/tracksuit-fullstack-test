import type { Router } from "@oak/oak";

export function registerCreateInsightRoute(router: Router): void {
  router.get("/insights/create", (_ctx) => {
    // TODO
  });
}
