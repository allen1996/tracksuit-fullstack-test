import { useEffect, useState } from "react";
import { type CreateInsight, Insight } from "$schemas/insight.ts";

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
        if (!controller.signal.aborted) {
          setInsights((current) => {
            if (!current) return data;
            const loadedIds = new Set(data.map(({ id }) => id));
            return [...data, ...current.filter(({ id }) => !loadedIds.has(id))];
          });
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) setError(true);
      });
    return () => controller.abort();
  }, []);

  const addInsight = async (input: CreateInsight): Promise<void> => {
    const response = await fetch("/api/insights/create", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(input),
    });
    if (!response.ok) throw new Error("Failed to add insight");

    const created = Insight.parse(await response.json());
    setInsights((current) => [...(current ?? []), created]);
    setError(false);
  };

  const deleteInsight = async (id: number): Promise<void> => {
    const response = await fetch(`/api/insights/${id}`, { method: "DELETE" });
    if (!response.ok) throw new Error("Failed to delete insight");
    setInsights((current) => current?.filter((insight) => insight.id !== id) ?? null);
  };

  return { insights, error, addInsight, deleteInsight };
}
