/**
 * UX-2.25 — Workspace density spacing SSOT (compose-only).
 * UX-I3 — Consumes certified Design System --spacing-* (no local spacing fork).
 * Canonical spacing authority for the workspace.
 * MUST NOT import or re-export UI_TOKENS or other *_TOKENS objects.
 * Mirrors (Layout / Surface / Content / Semantic) must match these values —
 * never the reverse.
 */
export const WORKSPACE_DENSITY_TOKENS = {
  panelPadding: "p-[var(--spacing-compact)]",
  panelGap: "gap-[var(--spacing-tight)]",
  headerHeight: "min-h-8",
  headerGap: "gap-[var(--spacing-tight)]",
  contentGap: "gap-[var(--spacing-tight)]",
  sectionGap: "my-[var(--spacing-compact)]",
  rowGap: "gap-[var(--spacing-tight)]",
  controlHeight: "min-h-4",
  toolbarGap: "gap-[var(--spacing-tight)]",
  iconGap: "gap-1.5",
  listGap: "gap-1.5",
  cardGap: "gap-[var(--spacing-tight)]",
} as const;
