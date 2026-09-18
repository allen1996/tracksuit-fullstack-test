import { Database } from "@db/sqlite";
import * as path from "@std/path";
import * as insightsTable from "$tables/insights.ts";

export const setupDatabase = async (filePath: string): Promise<Database> => {
  const resolvedPath = path.resolve(filePath);

  await Deno.mkdir(path.dirname(resolvedPath), { recursive: true });
  console.log(`Opening SQLite database at ${resolvedPath}`);

  const db = new Database(resolvedPath);

  try {
    db.exec(insightsTable.createTable);
    return db;
  } catch (error) {
    db.close();
    throw error;
  }
};
