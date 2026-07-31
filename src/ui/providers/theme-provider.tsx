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
import {
  InternalRuntimeProvider,
  stableRuntime,
} from "../theme/runtime/context";
import { SnapshotBuilder } from "../theme/runtime/devtools";
import { RuntimeNotifier } from "../theme/runtime/observer";
import type { ThemeRuntime } from "../theme/runtime/selectors/ThemeSelector";
import { resolve } from "../theme/tokens/runtime/ThemeTokenResolver";
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
 * UX-3.7 — private ThemeRuntime identity stabilization (InternalRuntimeProvider).
 * UX-3.9 — private Runtime observers (fingerprint notify on identity change only).
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

  // UX-3.7 — obtain TokenCache-built runtime, stabilize reference only.
  const resolvedRuntime = useMemo(() => resolve(theme), [theme]);
  const previousRuntimeRef = useRef<ThemeRuntime | null>(null);
  const previousFingerprintRef = useRef<string | undefined>(undefined);
  const previousRuntime = previousRuntimeRef.current;
  const stabilizedRuntime = stableRuntime(resolvedRuntime, previousRuntime);
  previousRuntimeRef.current = stabilizedRuntime;

  // UX-3.9 — notify private observers only when runtime identity changes.
  if (stabilizedRuntime !== previousRuntime) {
    const snapshot = SnapshotBuilder.build(stabilizedRuntime);
    RuntimeNotifier.notifyIfChanged(
      previousFingerprintRef.current,
      snapshot.fingerprint,
    );
    previousFingerprintRef.current = snapshot.fingerprint;
  }

  return (
    <ThemeContext.Provider value={value}>
      <InternalRuntimeProvider value={stabilizedRuntime}>
        <div {...{ [attribute]: theme }} style={hostStyle}>
          {children}
        </div>
      </InternalRuntimeProvider>
    </ThemeContext.Provider>
  );
}

export { useTheme };
