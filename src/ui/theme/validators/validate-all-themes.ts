import { isTokenRef, semantic } from "../../foundation/tokens";
import { THEME_IDS, type ThemeId } from "../ids";
import { themes } from "../maps";
import type { ThemeMapIssue } from "./validate-theme-map";
import { validateThemeMap } from "./validate-theme-map";

export type AllThemesIssue =
  | { readonly kind: "missing-theme"; readonly id: ThemeId }
  | { readonly kind: "map"; readonly id: ThemeId; readonly issue: ThemeMapIssue }
  | {
      readonly kind: "light-semantic-mismatch";
      readonly path: string;
      readonly detail: string;
    };

function collectRefPaths(
  node: unknown,
  pathPrefix: string,
  out: Map<string, string>,
): void {
  if (isTokenRef(node)) {
    out.set(pathPrefix, node.path);
    return;
  }
  if (node === null || typeof node !== "object") return;
  for (const [key, value] of Object.entries(node as Record<string, unknown>)) {
    const next = pathPrefix ? `${pathPrefix}.${key}` : key;
    collectRefPaths(value, next, out);
  }
}

/**
 * Validate all four Theme Maps exist and resolve.
 * Also checks light map color/focus/elevation match Foundation semantic.
 */
export function validateAllThemes(): readonly AllThemesIssue[] {
  const issues: AllThemesIssue[] = [];

  for (const id of THEME_IDS) {
    const map = themes[id];
    if (!map) {
      issues.push({ kind: "missing-theme", id });
      continue;
    }
    for (const issue of validateThemeMap(map)) {
      issues.push({ kind: "map", id, issue });
    }
  }

  const light = themes.light;
  if (light) {
    const lightRefs = new Map<string, string>();
    const semanticRefs = new Map<string, string>();
    collectRefPaths(light.color, "color", lightRefs);
    collectRefPaths(light.focus, "focus", lightRefs);
    collectRefPaths(light.elevation, "elevation", lightRefs);
    collectRefPaths(semantic.color, "color", semanticRefs);
    collectRefPaths(semantic.focus, "focus", semanticRefs);
    collectRefPaths(semantic.elevation, "elevation", semanticRefs);

    for (const [path, target] of semanticRefs) {
      const lightTarget = lightRefs.get(path);
      if (lightTarget === undefined) {
        issues.push({
          kind: "light-semantic-mismatch",
          path,
          detail: "missing in light map",
        });
      } else if (lightTarget !== target) {
        issues.push({
          kind: "light-semantic-mismatch",
          path,
          detail: `light=${lightTarget} semantic=${target}`,
        });
      }
    }
  }

  return issues;
}

export function assertAllThemesValid(): void {
  const issues = validateAllThemes();
  if (issues.length > 0) {
    throw new Error(
      `Invalid themes: ${JSON.stringify(issues, null, 2)}`,
    );
  }
}
