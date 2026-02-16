import React, { createContext, useContext, useState, useEffect } from "react";

type Theme = "light" | "dark";
type ColorTheme = "default" | "purple" | "ocean" | "rose" | "sunset" | "gold";

interface ThemeContextType {
  theme: Theme;
  colorTheme: ColorTheme;
  toggleTheme: () => void;
  setColorTheme: (color: ColorTheme) => void;
  setCustomTheme: (rgb: { r: number; g: number; b: number }) => void;
  resetTheme: () => void;
}

import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

const ThemeContext = createContext<ThemeContextType | null>(null);

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}

const THEME_KEY = "sonicflow_theme";
const COLOR_THEME_KEY = "sonicflow_color_theme";

// Helper to convert RGB to HSL
const rgbToHsl = (r: number, g: number, b: number) => {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0; // achromatic
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  };
};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
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

  // Apply predefined color themes
  useEffect(() => {
    const root = document.documentElement;
    // Remove all theme classes first
    root.classList.remove("theme-purple", "theme-ocean", "theme-rose", "theme-sunset", "theme-gold");

    // Clear any custom styles if switching back to a preset
    if (colorTheme !== "default") {
      root.classList.add(`theme-${colorTheme}`);
    }

    resetThemeStyles();

    localStorage.setItem(COLOR_THEME_KEY, colorTheme);
  }, [colorTheme]);

  // Sync theme to Supabase
  useEffect(() => {
    if (!user) return;

    const syncTheme = async () => {
      const { data } = await supabase
        .from('user_data')
        .select('theme_preferences')
        .eq('user_id', user.id)
        .single();

      if (data?.theme_preferences) {
        setTheme(data.theme_preferences.theme || 'dark');
        setColorThemeState(data.theme_preferences.colorTheme || 'default');
      }
    };

    syncTheme();
  }, [user]);

  // Save theme to Supabase
  useEffect(() => {
    if (!user) return;

    const timeout = setTimeout(async () => {
      await supabase.from('user_data').upsert({
        user_id: user.id,
        theme_preferences: { theme, colorTheme }
      }, { onConflict: 'user_id' });
    }, 1000);

    return () => clearTimeout(timeout);
  }, [theme, colorTheme, user]);

  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  const setColorTheme = (color: ColorTheme) => {
    setColorThemeState(color);
    resetThemeStyles(); // Ensure custom styles are removed when user picks a theme
  };

  const resetThemeStyles = () => {
    const root = document.documentElement;
    root.style.removeProperty('--primary');
    root.style.removeProperty('--accent');
    root.style.removeProperty('--ring');
    root.style.removeProperty('--emerald-glow');
    root.style.removeProperty('--glow-emerald');
    root.style.removeProperty('--sidebar-primary');
    root.style.removeProperty('--sidebar-ring');
  };

  const setCustomTheme = (rgb: { r: number; g: number; b: number }) => {
    const root = document.documentElement;
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

    // Create accent by shifting hue by 30 degrees
    const accentH = (hsl.h + 30) % 360;

    root.style.setProperty('--primary', `${hsl.h} ${hsl.s}% ${hsl.l}%`);
    root.style.setProperty('--accent', `${accentH} ${hsl.s - 10}% ${hsl.l - 5}%`);
    root.style.setProperty('--ring', `${hsl.h} ${hsl.s}% ${hsl.l}%`);

    // Update glow colors
    root.style.setProperty('--emerald-glow', `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`);
    root.style.setProperty('--glow-emerald', `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.5)`);

    root.style.setProperty('--sidebar-primary', `${hsl.h} ${hsl.s}% ${hsl.l}%`);
    root.style.setProperty('--sidebar-ring', `${hsl.h} ${hsl.s}% ${hsl.l}%`);
  };

  const resetTheme = () => {
    resetThemeStyles();
    // Re-trigger the effect to apply the current colorTheme class if needed
    const root = document.documentElement;
    if (colorTheme !== "default") {
      root.classList.add(`theme-${colorTheme}`);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, colorTheme, toggleTheme, setColorTheme, setCustomTheme, resetTheme }}>
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
