"use client";

import { createContext, useContext } from "react";
import type { ThemeId } from "../theme/ids";

export type ThemeContextValue = {
  readonly theme: ThemeId;
  readonly setTheme: (next: ThemeId) => void;
  readonly cssVars: Readonly<Record<string, string>>;
};

export const ThemeContext = createContext<ThemeContextValue | null>(null);

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return ctx;
}
