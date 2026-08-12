"use client";

import { useEffect } from "react";
import type { ThemeMode } from "@/lib/app-preferences";
import { useTheme } from "@/ui";

/**
 * CRP-6.1 — Bridge page themeMode (user preferences) into ThemeProvider CSS vars.
 * Without this, Settings "Tema oscuro" only flips shell class strings while
 * Design System tokens remain locked to ThemeRuntimeHost default (light).
 */
export function ThemeModeSync({ themeMode }: { themeMode: ThemeMode }) {
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    if (theme !== themeMode) {
      setTheme(themeMode);
    }
  }, [theme, themeMode, setTheme]);

  return null;
}
