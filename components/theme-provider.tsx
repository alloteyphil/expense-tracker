"use client";

import * as React from "react";

type Theme = "light" | "dark" | "system";

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  enableSystem?: boolean;
  storageKey?: string;
  attribute?: "class";
};

type ThemeContextValue = {
  theme: Theme;
  resolvedTheme: "light" | "dark";
  setTheme: (theme: Theme) => void;
};

const ThemeContext = React.createContext<ThemeContextValue | null>(null);

function getSystemTheme() {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function ThemeProvider({
  children,
  defaultTheme = "system",
  enableSystem = true,
  storageKey = "trackr-theme",
}: ThemeProviderProps) {
  const [theme, setThemeState] = React.useState<Theme>(() => {
    if (typeof window === "undefined") return defaultTheme;
    const saved = window.localStorage.getItem(storageKey) as Theme | null;
    return saved ?? defaultTheme;
  });
  const [systemTheme, setSystemTheme] = React.useState<"light" | "dark">(getSystemTheme);

  React.useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => setSystemTheme(media.matches ? "dark" : "light");
    onChange();
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  const resolvedTheme: "light" | "dark" = theme === "system" ? systemTheme : theme;

  React.useEffect(() => {
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(resolvedTheme);
    document.documentElement.style.colorScheme = resolvedTheme;
  }, [resolvedTheme]);

  const setTheme = React.useCallback(
    (nextTheme: Theme) => {
      const safeTheme = nextTheme === "system" && !enableSystem ? "light" : nextTheme;
      setThemeState(safeTheme);
      window.localStorage.setItem(storageKey, safeTheme);
    },
    [enableSystem, storageKey],
  );

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = React.useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}
