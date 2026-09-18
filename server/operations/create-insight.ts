import type { CreateInsight, Insight } from "$models/insight.ts";
import type { HasDBClient } from "$server-utils/shared.ts";
import lookupInsight from "$operations/lookup-insight.ts";
import { insertStatement } from "$tables/insights.ts";

type Input = HasDBClient & CreateInsight & {
  createdAt?: Date;
};

export default ({ db, brand, text, createdAt = new Date() }: Input): Insight => {
  db.exec(insertStatement, brand, createdAt.toISOString(), text);

  const insight = lookupInsight({ db, id: db.lastInsertRowId });
  if (!insight) {
    throw new Error("Created insight could not be retrieved");
  }

  return insight;
};
