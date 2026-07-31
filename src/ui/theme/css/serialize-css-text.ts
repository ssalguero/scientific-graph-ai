import type { ThemeId } from "../ids";
import type { ThemeMap } from "../types";
import { getThemeCssVars } from "./generate-css-variables";

/**
 * Serialize theme CSS variables to a CSS rule text block.
 * Pure — does not write files or touch the DOM.
 *
 * @param theme ThemeId or ThemeMap
 * @param selector CSS selector; default `[data-theme="<id>"]`
 */
export function getThemeCssText(
  theme: ThemeId | ThemeMap,
  selector?: string,
): string {
  const cssVars = getThemeCssVars(theme);
  const id = typeof theme === "string" ? theme : theme.id;
  const sel = selector ?? `[data-theme="${id}"]`;

  const body = Object.entries(cssVars)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([name, value]) => `  ${name}: ${value};`)
    .join("\n");

  return `${sel} {\n${body}\n}`;
}

/** @deprecated Use getThemeCssText — alias for plan naming clarity. */
export const serializeCssText = getThemeCssText;
