import * as oak from "@oak/oak";
import { Port } from "$utils/index.ts";
import { registerRoutes } from "./routes/index.ts";
import { setupDatabase } from "./infra/database.ts";

console.log("Loading configuration");

const env = {
  port: Port.parse(Deno.env.get("SERVER_PORT")),
};

const db = await setupDatabase("tmp/db.sqlite3");

console.log("Initialising server");
const router = new oak.Router();
registerRoutes(router, db);

const app = new oak.Application();
app.use(router.routes());
app.use(router.allowedMethods());

console.log(`Started server on port ${env.port}`);

try {
  await app.listen(env);
} finally {
  db.close();
}
