/**
 * UX-2.18 — Semantic layout spacing SSOT.
 * Density-equivalent mirror of UX-2.25 WORKSPACE_DENSITY_TOKENS (compose-only).
 * Layout package reads these keys only — no surface or density token imports.
 * Unidirectional parity: Density is authority; this file must match Density.
 */
export const LAYOUT_TOKENS = {
  /** Gap between PanelLayout region children (matches composition md gap). */
  panelGap: "gap-2",
  /** Internal gap inside PanelHeaderRegion. */
  headerGap: "gap-2",
  /** Internal gap inside PanelToolbarRegion (matches composition md gap). */
  toolbarGap: "gap-2",
  /** Internal gap inside PanelContentRegion. */
  contentGap: "gap-2",
  /** Internal gap inside PanelFooterRegion. */
  footerGap: "gap-2",
  /** Region padding scale (matches composition section padding). Default usage: none. */
  regionPadding: {
    none: "",
    sm: "p-1.5",
    md: "p-2.5",
  },
  /** Empty region min-height — no visual footprint this phase. */
  emptyMinHeight: "min-h-0",
} as const;
