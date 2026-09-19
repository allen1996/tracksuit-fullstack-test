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

export function registerStaticFiles(app: Application, root = dist): void {
  app.use(async (ctx) => {
    const pathname = ctx.request.url.pathname;
    if (pathname.startsWith("/api")) return;

    const asset = pathname.startsWith("/assets/") || pathname === "/favicon.svg" ? pathname : "/index.html";
    const file = path.resolve(root, `.${asset}`);
    if (!file.startsWith(`${root}/`)) {
      ctx.response.status = 404;
      return;
    }

    try {
      let body: Uint8Array | undefined;
      ctx.response.headers.set("Vary", "Accept-Encoding");
      if (ctx.request.headers.has("Accept-Encoding") && ctx.request.acceptsEncodings("gzip", "identity") === "gzip") {
        try {
          body = await Deno.readFile(`${file}.gz`);
          ctx.response.headers.set("Content-Encoding", "gzip");
        } catch (error) {
          if (!(error instanceof Deno.errors.NotFound)) throw error;
        }
      }
      if (!body) {
        if (!ctx.request.acceptsEncodings("identity")) {
          ctx.response.status = 406;
          return;
        }
        body = await Deno.readFile(file);
      }
      ctx.response.body = body;
      // Vite fingerprints build assets. HTML and the fixed-name favicon must stay fresh.
      ctx.response.headers.set(
        "Cache-Control",
        asset.startsWith("/assets/") ? "public, max-age=31536000, immutable" : "no-cache",
      );
      ctx.response.type = contentTypes[path.extname(file)] ?? "application/octet-stream";
    } catch (error) {
      if (!(error instanceof Deno.errors.NotFound)) throw error;
      ctx.response.status = 404;
    }
  });
}
