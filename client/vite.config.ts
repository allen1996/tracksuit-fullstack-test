import deno from "@deno/vite-plugin";
import { Port } from "$utils/index.ts";
import react from "@vitejs/plugin-react";
import { searchForWorkspaceRoot } from "vite";
import { defineConfig } from "vitest/config";
import process from "node:process";
import { gzipSync } from "node:zlib";
import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import workspaceConfig from "../deno.json" with { type: "json" };
import clientConfig from "./deno.json" with { type: "json" };

// Keep Vite and Vitest aliases in sync with the Deno import maps.
const aliases = [
  { imports: workspaceConfig.imports, base: new URL("../", import.meta.url) },
  { imports: clientConfig.imports, base: new URL("./", import.meta.url) },
].flatMap(({ imports, base }) =>
  Object.entries(imports)
    .filter(([name]) => name.startsWith("$"))
    .map(([name, target]) => ({
      find: name.replace(/\/$/, ""),
      replacement: fileURLToPath(new URL(target, base)).replace(/\/$/, ""),
    }))
);

export default defineConfig(({ command }) => ({
  root: "./src",
  build: {
    outDir: "./dist",
    emptyOutDir: true,
  },
  plugins: [
    react(),
    {
      name: "vite-virtual-modules",
      enforce: "pre",
      // Keep Vite's internal preload helper out of the Deno package resolver.
      resolveId(id) {
        if (id.startsWith("\0")) return id;
      },
    },
    deno(),
    {
      name: "precompress-static-assets",
      apply: "build",
      async writeBundle(options, bundle) {
        // Compress once at build time, rather than on every page request.
        await Promise.all(
          Object.values(bundle).filter((entry) => /\.(?:html|css|js)$/.test(entry.fileName)).map((entry) =>
            writeFile(
              resolve(options.dir!, `${entry.fileName}.gz`),
              gzipSync(entry.type === "chunk" ? entry.code : entry.source, { level: 9 }),
            )
          ),
        );
      },
    },
  ],
  resolve: {
    alias: aliases,
  },
  environments: {
    client: {
      dev: {
        // Vitest loads its own dependencies; avoid eager browser transforms.
        preTransformRequests: !process.env.VITEST,
      },
    },
  },
  server: command === "serve"
    ? {
      port: Port.parse(Deno.env.get("CLIENT_PORT")),
      fs: {
        allow: [searchForWorkspaceRoot(process.cwd()), "../../node_modules"],
      },
      proxy: {
        "/api": {
          target: `${Deno.env.get("SERVER_BASE_URL")}:${Port.parse(Deno.env.get("SERVER_PORT"))}`,
          changeOrigin: true,
        },
      },
    }
    : undefined,
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
  },
}));
