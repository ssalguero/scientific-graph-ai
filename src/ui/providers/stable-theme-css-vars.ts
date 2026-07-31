/**
 * UX-3.4.3 — Private ThemeId → cssVars identity cache for ThemeProvider.
 * Same values as getThemeCssVars; only stabilizes object references.
 * Not exported from public barrels.
 */

import { getThemeCssVars, type ThemeId } from "../theme";

const cssVarsByThemeId = new Map<ThemeId, Readonly<Record<string, string>>>();

/** Stable cssVars reference per ThemeId (values identical to getThemeCssVars). */
export function getStableThemeCssVars(
  theme: ThemeId,
): Readonly<Record<string, string>> {
  const cached = cssVarsByThemeId.get(theme);
  if (cached) {
    return cached;
  }
  const vars = getThemeCssVars(theme);
  cssVarsByThemeId.set(theme, vars);
  return vars;
}
