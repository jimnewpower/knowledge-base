import { useEffect, useState } from "react";

export type Theme = "light" | "dark";

// Keep in sync with the pre-paint script in index.html, which applies the theme before React loads.
export const themeStorageKey = "kb-theme";

export function currentTheme(): Theme {
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(currentTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    try {
      localStorage.setItem(themeStorageKey, next);
    } catch {
      // Storage can be blocked (private mode, disabled site data); the choice still applies for this visit.
    }
  };

  return { theme, toggleTheme };
}
