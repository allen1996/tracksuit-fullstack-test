import { useState } from "react";
import { AddInsight } from "$components/add-insight/add-insight.tsx";
import { Button } from "$components/button/button.tsx";
import { SparklesIcon } from "lucide-react";
import { Header } from "$components/header/header.tsx";
import { Insights } from "$components/insights/insights.tsx";
import { useInsights } from "$hooks/use-insights.ts";
import styles from "./app.module.css";

export const App = () => {
  const { insights, error, addInsight, deleteInsight } = useInsights();
  const [addInsightOpen, setAddInsightOpen] = useState(false);
  const brandCount = new Set(insights?.map(({ brand }) => brand)).size;

  return (
    <div className={styles.page}>
      <a className={styles.skip} href="#insights">Skip to insights</a>
      <Header />
      <main className={styles.main} id="insights" tabIndex={-1}>
        <section className={styles.hero} aria-labelledby="page-title">
          <div className={styles.intro}>
            <p className={styles.eyebrow}>
              <SparklesIcon size={16} aria-hidden="true" /> A little insight. A big difference.
            </p>
            <h1 id="page-title">
              Good insights.<br />
              <span>Great next moves.</span>
            </h1>
            <p className={styles.description}>
              A home for what’s happening with your brands.<br className={styles.lineBreak} />{" "}
              Capture the observations that move you forward.
            </p>
          </div>
          <svg className={styles.art} viewBox="0 0 260 230" fill="none" aria-hidden="true" focusable="false">
            <g className={styles.orbit}>
              <ellipse cx="99" cy="120" rx="51" ry="79" transform="rotate(-30 99 120)" pathLength="1" />
            </g>
            <g className={styles.orbitReverse}>
              <ellipse cx="160" cy="120" rx="51" ry="79" transform="rotate(30 160 120)" pathLength="1" />
            </g>
            <g className={styles.artBadge}>
              <g transform="rotate(-9 132 116)">
                <rect x="94" y="78" width="76" height="76" rx="22" fill="#d8ed95" />
                <path
                  className={styles.arrow}
                  d="M118 130L145 103M122 103H145V126"
                  stroke="#354a22"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  pathLength="1"
                />
              </g>
            </g>
            <g className={styles.spark} stroke="#cf3f78" strokeWidth="2.5" strokeLinecap="round">
              <path d="M225 17V55M206 36H244M212 23L238 49M212 49L238 23" />
            </g>
          </svg>
        </section>
        <section className={styles.insights} aria-labelledby="insights-title">
          <div className={styles.toolbar}>
            <div>
              <h2 className={styles.heading} id="insights-title">
                Your insights {insights !== null && <span className={styles.count}>{insights.length}</span>}
              </h2>
              <p className={styles.subtitle}>Fresh perspectives, all in one place.</p>
            </div>
            <div className={styles.insightActions}>
              {brandCount > 0 && (
                <span className={styles.total}>{brandCount} {brandCount === 1 ? "brand" : "brands"} in view</span>
              )}
              <Button label="Add insight" onClick={() => setAddInsightOpen(true)} />
            </div>
          </div>
          {error && insights === null
            ? <p className={styles.state} role="alert">Could not load insights.</p>
            : insights === null
            ? <p className={styles.state} role="status">Loading insights...</p>
            : <Insights insights={insights} onDelete={deleteInsight} />}
        </section>
      </main>
      <AddInsight open={addInsightOpen} onClose={() => setAddInsightOpen(false)} onAdd={addInsight} />
      <footer className={styles.footer}>
        <span>Suit Tracker</span>
        <span>Small observations. Bigger possibilities.</span>
      </footer>
    </div>
  );
};
