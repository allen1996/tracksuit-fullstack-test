import type { HasDBClient } from "$server-utils/shared.ts";
import { deleteInsightStatement } from "$tables/insights.ts";

type Input = HasDBClient & {
  id: number;
};

export default ({ db, id }: Input): boolean => {
  return db.exec(deleteInsightStatement, id) > 0;
};
