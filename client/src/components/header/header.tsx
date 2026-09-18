import { useEffect, useState } from "react";
import { MonitorIcon, MoonIcon, SunIcon } from "lucide-react";
import styles from "./header.module.css";

export const HEADER_TEXT = "Suit Tracker";
type Theme = "system" | "light" | "dark";
const THEMES = [
  { value: "system", label: "System theme", Icon: MonitorIcon },
  { value: "light", label: "Light theme", Icon: SunIcon },
  { value: "dark", label: "Dark theme", Icon: MoonIcon },
] as const;

export const Header = () => {
  const [theme, setTheme] = useState<Theme>(() => {
    try {
      const saved = localStorage.getItem("suit-tracker-theme");
      return saved === "light" || saved === "dark" ? saved : "system";
    } catch {
      return "system";
    }
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem("suit-tracker-theme", theme);
    } catch {
      // The selected theme still works when browser storage is unavailable.
    }
  }, [theme]);

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <a href="/" className={styles.logo} aria-label="Suit Tracker home">
          <svg viewBox="0 0 32 32" aria-hidden="true">
            <path d="M7 10h18M16 5v17c0 5 7 5 9 1M7 16h14" />
          </svg>
          {HEADER_TEXT}
        </a>
        <div className={styles.actions}>
          <div className={styles.themes} role="group" aria-label="Appearance">
            {THEMES.map(({ value, label, Icon }) => (
              <button
                key={value}
                type="button"
                aria-label={label}
                title={label}
                aria-pressed={theme === value}
                onClick={() => setTheme(value)}
              >
                <Icon size={17} aria-hidden="true" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
};
