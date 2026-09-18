import type { Application } from "@oak/oak";
import * as path from "@std/path";

const dist = path.resolve(import.meta.dirname!, "../../client/src/dist");
const contentTypes: Record<string, string> = {
  ".css": "text/css",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".woff2": "font/woff2",
};

export function registerStaticFiles(app: Application): void {
  app.use(async (ctx) => {
    const pathname = ctx.request.url.pathname;
    if (pathname.startsWith("/api")) return;

    const asset = pathname.startsWith("/assets/") || pathname === "/favicon.svg" ? pathname : "/index.html";
    const file = path.resolve(dist, `.${asset}`);
    if (!file.startsWith(`${dist}/`)) {
      ctx.response.status = 404;
      return;
    }

    try {
      ctx.response.body = await Deno.readFile(file);
      ctx.response.type = contentTypes[path.extname(file)] ?? "application/octet-stream";
    } catch (error) {
      if (!(error instanceof Deno.errors.NotFound)) throw error;
      ctx.response.status = 404;
    }
  });
}
