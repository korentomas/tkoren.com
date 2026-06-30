import { useEffect, useState, Fragment } from "react";

export const THEMES = ["terminal", "paper", "amber"] as const;

export type Theme = (typeof THEMES)[number];

export function ThemePicker() {
  const [theme, setTheme] = useState<Theme>("terminal");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("theme") as Theme | null;
      if (saved && THEMES.includes(saved)) setTheme(saved);
    } catch {
      // Ignore storage access failures (e.g., Safari private mode).
    }
  }, []);

  const change = (next: Theme) => {
    setTheme(next);
    try {
      localStorage.setItem("theme", next);
    } catch {}
    document.documentElement.setAttribute("data-theme", next);
  };

  return (
    <p className="theme-picker">
      <span>theme: </span>
      {THEMES.map((t, i) => (
        <Fragment key={t}>
          {i > 0 && " · "}
          <button
            type="button"
            className={`theme-btn${theme === t ? " theme-btn-active" : ""}`}
            onClick={() => change(t)}
            aria-pressed={theme === t}
          >
            {t}
          </button>
        </Fragment>
      ))}
    </p>
  );
}
