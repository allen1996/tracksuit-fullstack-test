import type { Router } from "@oak/oak";

export function registerHealthRoute(router: Router): void {
  router.get("/_health", (ctx) => {
    ctx.response.body = "OK";
    ctx.response.status = 200;
  });
}
