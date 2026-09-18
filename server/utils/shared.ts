import type { Database } from "@db/sqlite";

export type HasDBClient = {
  db: Database;
};

export const requireEnv = (name: string): string => {
  const value = Deno.env.get(name)?.trim();

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
};
