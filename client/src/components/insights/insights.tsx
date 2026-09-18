import { useState } from "react";
import { Trash2Icon } from "lucide-react";
import { DeleteInsight } from "$components/delete-insight/delete-insight.tsx";
import { cx } from "$lib/cx.ts";
import styles from "./insights.module.css";
import type { Insight } from "$schemas/insight.ts";

type InsightsProps = {
  insights: Insight[];
  onDelete(id: number): Promise<void>;
  className?: string;
};

export const Insights = ({ insights, onDelete, className }: InsightsProps) => {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const selectedInsight = insights.find(({ id }) => id === selectedId) ?? null;

  return (
    <div className={cx(className)}>
      <h1 className={styles.heading}>Insights</h1>
      <div className={styles.list}>
        {insights.length ? (
          insights.map(({ id, text, createdAt, brand }) => (
            <div className={styles.insight} key={id}>
              <div className={styles["insight-meta"]}>
                <span>Brand {brand}</span>
                <div className={styles["insight-meta-details"]}>
                  <time dateTime={createdAt.toISOString()}>
                    {createdAt.toLocaleString(undefined, {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </time>
                  <button
                    type="button"
                    className={styles["insight-delete"]}
                    aria-label={`Delete insight ${id}`}
                    onClick={() => setSelectedId(id)}
                  >
                    <Trash2Icon aria-hidden="true" />
                  </button>
                </div>
              </div>
              <p className={styles["insight-content"]}>{text}</p>
            </div>
          ))
        ) : (
          <p>We have no insight!</p>
        )}
      </div>
      <DeleteInsight
        insight={selectedInsight}
        onClose={() => setSelectedId(null)}
        onDelete={onDelete}
      />
    </div>
  );
};
