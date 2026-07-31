import { isTokenRef, semantic } from "../../foundation/tokens";
import type { ThemeId } from "../ids";
import { themes } from "../maps";
import type { ResolvedTheme, ThemeMap } from "../types";
import { resolveTokenRef } from "./resolve-token-ref";
import { toCssVarName } from "./to-css-var-name";

const INVARIANT_DOMAINS = [
  "spacing",
  "radius",
  "typography",
  "motion",
  "opacity",
  "zIndex",
] as const;

function walkRefs(
  node: unknown,
  pathPrefix: string,
  out: Record<string, string>,
): void {
  if (isTokenRef(node)) {
    out[toCssVarName(pathPrefix)] = resolveTokenRef(node);
    return;
  }

  if (node === null || typeof node !== "object") {
    return;
  }

  for (const [key, value] of Object.entries(node as Record<string, unknown>)) {
    const next = pathPrefix ? `${pathPrefix}.${key}` : key;
    walkRefs(value, next, out);
  }
}

function buildCssVars(map: ThemeMap): Record<string, string> {
  const cssVars: Record<string, string> = {};

  walkRefs(map.color, "color", cssVars);
  walkRefs(map.focus, "focus", cssVars);
  walkRefs(map.elevation, "elevation", cssVars);

  for (const domain of INVARIANT_DOMAINS) {
    walkRefs(semantic[domain], domain, cssVars);
  }

  return cssVars;
}

/** Resolve a ThemeId (or ThemeMap) to cssVars. Pure. */
export function resolveTheme(theme: ThemeId | ThemeMap): ResolvedTheme {
  const map = typeof theme === "string" ? themes[theme] : theme;
  if (!map) {
    throw new Error(`Unknown theme: ${String(theme)}`);
  }
  return {
    id: map.id,
    cssVars: buildCssVars(map),
  };
}

/** Flat map of CSS custom property → value for the given theme. Pure. */
export function getThemeCssVars(
  theme: ThemeId | ThemeMap,
): Readonly<Record<string, string>> {
  return resolveTheme(theme).cssVars;
}
