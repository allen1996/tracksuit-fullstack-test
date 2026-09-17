import deno from "@deno/vite-plugin";
import { Port } from "../lib/utils/index.ts";
import react from "@vitejs/plugin-react";
import { searchForWorkspaceRoot } from "vite";
import { defineConfig } from "vitest/config";
import process from "node:process";

const env = {
  clientPort: Port.parse(Deno.env.get("CLIENT_PORT")),
  servereBaseUrl: String(Deno.env.get("SERVER_BASE_URL")),
  serverPort: Port.parse(Deno.env.get("SERVER_PORT")),
};

export default defineConfig({
  root: "./src",
  build: {
    outDir: "./dist",
    emptyOutDir: true,
  },
  plugins: [react(), deno()],
  environments: {
    client: {
      dev: {
        // Vitest loads its own dependencies; avoid eager browser transforms.
        preTransformRequests: !process.env.VITEST,
      },
    },
  },
  server: {
    port: env.clientPort,
    fs: {
      allow: [searchForWorkspaceRoot(process.cwd()), "../../node_modules"],
    },
    proxy: {
      "/api": {
        target: `${env.servereBaseUrl}:${env.serverPort}`,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
  },
});
