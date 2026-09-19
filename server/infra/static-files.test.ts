import { Application } from "@oak/oak";
import { expect } from "@std/expect";
import { afterAll, beforeAll, describe, it } from "@std/testing/bdd";
import { gunzipSync, gzipSync } from "node:zlib";
import { registerStaticFiles } from "./static-files.ts";

describe("static assets", () => {
  let root: string;
  let app: Application;
  const script = "console.log('compressed asset');";
  beforeAll(async () => {
    root = await Deno.makeTempDir();
    await Deno.mkdir(`${root}/assets`);
    await Deno.writeTextFile(`${root}/index.html`, "<html>App</html>");
    await Deno.writeTextFile(`${root}/favicon.svg`, "<svg/>");
    await Deno.writeTextFile(`${root}/assets/app-12345678.js`, script);
    await Deno.writeFile(`${root}/assets/app-12345678.js.gz`, gzipSync(script));
    app = new Application();
    registerStaticFiles(app, root);
  });
  afterAll(() => Deno.remove(root, { recursive: true }));

  async function request(path: string, encoding?: string) {
    const response = await app.handle(
      new Request(`http://localhost${path}`, {
        headers: encoding === undefined ? {} : { "Accept-Encoding": encoding },
      }),
    );
    if (!response) throw new Error("Oak did not respond");
    return response;
  }

  it("serves precompressed JavaScript with its original content type and cache policy", async () => {
    const response = await request("/assets/app-12345678.js", "gzip, deflate, br");
    expect(response.headers.get("Content-Encoding")).toBe("gzip");
    expect(response.headers.get("Content-Type")).toContain("javascript");
    expect(response.headers.get("Vary")).toBe("Accept-Encoding");
    expect(response.headers.get("Cache-Control")).toBe("public, max-age=31536000, immutable");
    expect(gunzipSync(new Uint8Array(await response.arrayBuffer())).toString()).toBe(script);
  });

  it("respects disabled gzip and clients without an encoding header", async () => {
    for (const encoding of [undefined, "gzip;q=0, identity;q=1"]) {
      const response = await request("/assets/app-12345678.js", encoding);
      expect(response.headers.get("Content-Encoding")).toBeNull();
      expect(await response.text()).toBe(script);
    }
  });

  it("falls back when gzip is unavailable and revalidates HTML and the favicon", async () => {
    for (const path of ["/", "/favicon.svg"]) {
      const response = await request(path, "gzip");
      expect(response.status).toBe(200);
      expect(response.headers.get("Content-Encoding")).toBeNull();
      expect(response.headers.get("Cache-Control")).toBe("no-cache");
      await response.arrayBuffer();
    }
  });

  it("does not cache missing assets or serve forbidden encodings", async () => {
    const missing = await request("/assets/missing.js", "gzip");
    expect(missing.status).toBe(404);
    expect(missing.headers.get("Cache-Control")).toBeNull();
    await missing.arrayBuffer();
    const rejected = await request("/", "gzip;q=0, identity;q=0");
    expect(rejected.status).toBe(406);
    await rejected.arrayBuffer();
  });
});
