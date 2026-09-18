import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { LightbulbIcon, Trash2Icon } from "lucide-react";
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
  const reduceMotion = useReducedMotion();
  // Stagger the loaded cards only; later additions should appear immediately.
  const [entryDelays] = useState(() => new Map(insights.map(({ id }, index) => [id, Math.min(index * 0.12, 0.49)])));
  const transition = { duration: reduceMotion ? 0 : 0.24, ease: "easeOut" as const };
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const selectedInsight = insights.find(({ id }) => id === selectedId) ?? null;

  return (
    <div className={cx(className)}>
      <div className={styles.list}>
        <AnimatePresence mode="popLayout">
          {insights.length
            ? (
              insights.map(({ id, text, createdAt, brand }) => (
                <motion.article
                  className={styles.insight}
                  key={id}
                  layout={reduceMotion ? false : "position"}
                  initial={{ opacity: reduceMotion ? 1 : 0, y: reduceMotion ? 0 : 12 }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    transition: { ...transition, delay: reduceMotion ? 0 : entryDelays.get(id) ?? 0 },
                  }}
                  exit={{ opacity: 0, scale: reduceMotion ? 1 : 0.97, pointerEvents: "none" }}
                  transition={transition}
                >
                  <div className={styles["insight-meta"]}>
                    <span className={styles.brand}>
                      <span aria-hidden="true" />Brand {brand}
                    </span>
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
                </motion.article>
              ))
            )
            : (
              <motion.div
                className={styles.empty}
                key="empty"
                initial={{ opacity: reduceMotion ? 1 : 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={transition}
              >
                <span className={styles.emptyIcon}>
                  <LightbulbIcon size={28} aria-hidden="true" />
                </span>
                <h3>Your next great idea starts here</h3>
                <p>Add your first insight to keep your brand observations in one place.</p>
                <span>Use “Add insight” above to get started.</span>
              </motion.div>
            )}
        </AnimatePresence>
      </div>
      <DeleteInsight
        insight={selectedInsight}
        onClose={() => setSelectedId(null)}
        onDelete={onDelete}
      />
    </div>
  );
};
