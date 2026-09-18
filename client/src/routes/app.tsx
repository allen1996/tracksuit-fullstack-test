import { Header } from "$components/header/header.tsx";
import { Insights } from "$components/insights/insights.tsx";
import { useInsights } from "$hooks/use-insights.ts";
import styles from "./app.module.css";

export const App = () => {
  const { insights, error, addInsight, deleteInsight } = useInsights();

  return (
    <main className={styles.main}>
      <Header onAddInsight={addInsight} />
      {error && insights === null
        ? (
          <p className={styles.insights} role="alert">
            Could not load insights.
          </p>
        )
        : insights === null
        ? (
          <p className={styles.insights} role="status">
            Loading insights...
          </p>
        )
        : <Insights className={styles.insights} insights={insights} onDelete={deleteInsight} />}
    </main>
  );
};
