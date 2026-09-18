import { useEffect, useState } from "react";
import { Insight } from "$schemas/insight.ts";

async function fetchInsights(signal: AbortSignal): Promise<Insight[]> {
  const response = await fetch("/api/insights", { signal });
  if (!response.ok) throw new Error("Failed to load insights");
  return Insight.array().parse(await response.json());
}

export function useInsights() {
  const [insights, setInsights] = useState<Insight[] | null>(null);
  const [error, setError] = useState(false);

  // don't want to adding fetching library in here, just use AbortController to cancel requests when unmounts
  useEffect(() => {
    const controller = new AbortController();
    fetchInsights(controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) setInsights(data);
      })
      .catch(() => {
        if (!controller.signal.aborted) setError(true);
      });
    return () => controller.abort();
  }, []);

  return { insights, error };
}
