import * as oak from "@oak/oak";
import { Port } from "$utils/index.ts";
import { requireEnv } from "$server-utils/shared.ts";
import { registerRoutes } from "./routes/index.ts";
import { setupDatabase } from "./infra/database.ts";
import { registerStaticFiles } from "./infra/static-files.ts";

console.log("Loading configuration");

const env = {
  port: Port.parse(Deno.env.get("SERVER_PORT")),
};

const db = await setupDatabase(requireEnv("DB_PATH"));

console.log("Initialising server");
const router = new oak.Router({ prefix: "/api" });
registerRoutes(router, db);

const app = new oak.Application();
app.use(router.routes());
app.use(router.allowedMethods());
registerStaticFiles(app);

console.log(`Started server on port ${env.port}`);

try {
  await app.listen(env);
} finally {
  db.close();
}
