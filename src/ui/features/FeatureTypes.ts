/**
 * UX-5.1 — Feature Registry foundation types.
 * Immutable catalogs only — no runtime behavior, no React.
 */

export type FeatureId = string & { readonly __brand: "FeatureId" };

export function asFeatureId(id: string): FeatureId {
  return id as FeatureId;
}

export const FEATURE_CATEGORIES = Object.freeze({
  toolbar: "toolbar",
  sidebar: "sidebar",
  inspector: "inspector",
  panel: "panel",
  menu: "menu",
  workspace: "workspace",
  system: "system",
} as const);

export type FeatureCategory =
  (typeof FEATURE_CATEGORIES)[keyof typeof FEATURE_CATEGORIES];

export const FEATURE_CATEGORY_IDS: readonly FeatureCategory[] = Object.freeze([
  FEATURE_CATEGORIES.toolbar,
  FEATURE_CATEGORIES.sidebar,
  FEATURE_CATEGORIES.inspector,
  FEATURE_CATEGORIES.panel,
  FEATURE_CATEGORIES.menu,
  FEATURE_CATEGORIES.workspace,
  FEATURE_CATEGORIES.system,
]);
