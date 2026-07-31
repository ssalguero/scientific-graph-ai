"use client";

import {
  useCallback,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import {
  DEFAULT_THEME,
  isThemeId,
  type ThemeId,
} from "../theme";
import { getStableThemeCssVars } from "./stable-theme-css-vars";
import { ThemeContext, useTheme } from "./theme-context";

export type ThemeProviderProps = {
  /** Controlled theme id */
  theme?: ThemeId;
  /** Uncontrolled default; ignored when `theme` is set */
  defaultTheme?: ThemeId;
  children: ReactNode;
  /** Host attribute for CSS selectors; default data-theme */
  attribute?: "data-theme";
};

/**
 * Package-local ThemeProvider (UX-3.1.3).
 * UX-3.4.3 — stable setTheme (controlled ref) + stable cssVars identity cache.
 *
 * Effects are limited to the provider host element only:
 * - sets data-theme (or configured attribute)
 * - applies CSS custom properties via style
 *
 * Must NOT write to html/body/documentElement, register global listeners,
 * touch window/localStorage/cookies, or bridge UX-2.
 * Not mounted in the application in this microfase.
 */
export function ThemeProvider({
  theme: controlledTheme,
  defaultTheme = DEFAULT_THEME,
  children,
  attribute = "data-theme",
}: ThemeProviderProps) {
  const initial = isThemeId(defaultTheme) ? defaultTheme : DEFAULT_THEME;
  const [uncontrolled, setUncontrolled] = useState<ThemeId>(initial);

  const controlledRef = useRef(controlledTheme);
  controlledRef.current = controlledTheme;

  const theme: ThemeId =
    controlledTheme !== undefined && isThemeId(controlledTheme)
      ? controlledTheme
      : uncontrolled;

  const setTheme = useCallback((next: ThemeId) => {
    if (!isThemeId(next)) return;
    if (controlledRef.current === undefined) {
      setUncontrolled(next);
    }
  }, []);

  const cssVars = useMemo(() => getStableThemeCssVars(theme), [theme]);

  const hostStyle = useMemo(() => {
    return cssVars as CSSProperties;
  }, [cssVars]);

  const value = useMemo(
    () => ({ theme, setTheme, cssVars }),
    [theme, setTheme, cssVars],
  );

  return (
    <ThemeContext.Provider value={value}>
      <div {...{ [attribute]: theme }} style={hostStyle}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export { useTheme };
