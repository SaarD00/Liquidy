import React, { createContext, useContext, useState, useEffect } from "react";

type Theme = "light" | "dark";
type ColorTheme = "default" | "purple" | "ocean" | "rose" | "sunset" | "gold";

interface ThemeContextType {
  theme: Theme;
  colorTheme: ColorTheme;
  toggleTheme: () => void;
  setColorTheme: (color: ColorTheme) => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}

const THEME_KEY = "sonicflow_theme";
const COLOR_THEME_KEY = "sonicflow_color_theme";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem(THEME_KEY) as Theme) || "dark";
    }
    return "dark";
  });

  const [colorTheme, setColorThemeState] = useState<ColorTheme>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem(COLOR_THEME_KEY) as ColorTheme) || "default";
    }
    return "default";
  });

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  useEffect(() => {
    const root = document.documentElement;
    // Remove all theme classes
    root.classList.remove("theme-purple", "theme-ocean", "theme-rose", "theme-sunset", "theme-gold");
    // Add the selected theme class
    if (colorTheme !== "default") {
      root.classList.add(`theme-${colorTheme}`);
    }
    localStorage.setItem(COLOR_THEME_KEY, colorTheme);
  }, [colorTheme]);

  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));
  
  const setColorTheme = (color: ColorTheme) => setColorThemeState(color);

  return (
    <ThemeContext.Provider value={{ theme, colorTheme, toggleTheme, setColorTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const colorThemes = [
  { id: "default", name: "Spotify Green", color: "142 70% 45%" },
  { id: "purple", name: "Royal Purple", color: "270 70% 55%" },
  { id: "ocean", name: "Ocean Blue", color: "200 90% 50%" },
  { id: "rose", name: "Rose Pink", color: "350 80% 55%" },
  { id: "sunset", name: "Sunset Orange", color: "25 95% 55%" },
  { id: "gold", name: "Golden Hour", color: "45 90% 50%" },
] as const;
