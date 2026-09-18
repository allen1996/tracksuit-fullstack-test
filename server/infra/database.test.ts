import { expect } from "@std/expect";
import { setupDatabase } from "./database.ts";

Deno.test("setupDatabase accepts an in-memory SQLite database", async () => {
  const db = await setupDatabase(":memory:");
  try {
    expect(db.sql`SELECT COUNT(*) AS count FROM insights`).toEqual([{ count: 0 }]);
  } finally {
    db.close();
  }
});
