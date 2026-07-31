/**
 * UX-2.25 — Workspace density spacing SSOT (compose-only).
 * Canonical spacing authority for the workspace. Independent local map of
 * Tailwind spacing utilities.
 * MUST NOT import or re-export UI_TOKENS, SURFACE_TOKENS, CONTENT_TOKENS,
 * LAYOUT_TOKENS, SEMANTIC_TOKENS, NAVIGATION_TOKENS, or any other *_TOKENS object.
 * Mirrors (Layout / Surface / Content / Semantic) must match these values —
 * never the reverse.
 */
export const WORKSPACE_DENSITY_TOKENS = {
  panelPadding: "p-2.5",
  panelGap: "gap-2",
  headerHeight: "min-h-8",
  headerGap: "gap-2",
  contentGap: "gap-2",
  sectionGap: "my-2.5",
  rowGap: "gap-2",
  controlHeight: "min-h-4",
  toolbarGap: "gap-2",
  iconGap: "gap-1.5",
  listGap: "gap-1.5",
  cardGap: "gap-2",
} as const;
