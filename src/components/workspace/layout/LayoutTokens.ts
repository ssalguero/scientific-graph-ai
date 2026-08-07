/**
 * UX-2.18 — Semantic layout spacing SSOT.
 * UX-2.26 — Expanded with compose primitives (STACK_GAPS / align / justify / …).
 * UX-I3 — Mirrors WORKSPACE_DENSITY_TOKENS using Design System --spacing-*.
 * Layout package reads these keys only — no surface or density token imports.
 * Unidirectional parity: Density is authority; this file must match Density.
 */
export const LAYOUT_TOKENS = {
  /** Gap between PanelLayout region children (matches composition md gap). */
  panelGap: "gap-[var(--spacing-tight)]",
  /** Internal gap inside PanelHeaderRegion. */
  headerGap: "gap-[var(--spacing-tight)]",
  /** Internal gap inside PanelToolbarRegion (matches composition md gap). */
  toolbarGap: "gap-[var(--spacing-tight)]",
  /** Internal gap inside PanelContentRegion. */
  contentGap: "gap-[var(--spacing-tight)]",
  /** Internal gap inside PanelFooterRegion. */
  footerGap: "gap-[var(--spacing-tight)]",
  /** Region padding scale (matches composition section padding). Default usage: none. */
  regionPadding: {
    none: "",
    sm: "p-1.5",
    md: "p-[var(--spacing-compact)]",
  },
  /** Empty region min-height — no visual footprint this phase. */
  emptyMinHeight: "min-h-0",

  /** UX-2.26 — Stack / Inline / Cluster gap scale. */
  STACK_GAPS: {
    none: "",
    xs: "gap-1",
    sm: "gap-1.5",
    md: "gap-[var(--spacing-tight)]",
    lg: "gap-2.5",
    xl: "gap-[var(--spacing-compact)]",
  },
  /** UX-2.26 — Cross-axis alignment (items-*). */
  align: {
    none: "",
    start: "items-start",
    center: "items-center",
    end: "items-end",
    stretch: "items-stretch",
    baseline: "items-baseline",
  },
  /** UX-2.26 — Main-axis justification (justify-*). */
  justify: {
    none: "",
    start: "justify-start",
    center: "justify-center",
    end: "justify-end",
    between: "justify-between",
    around: "justify-around",
    evenly: "justify-evenly",
  },
  /** UX-2.26 — Flex wrap. */
  wrap: {
    nowrap: "",
    wrap: "flex-wrap",
  },
  /** UX-2.26 — Primitive flex direction roots. */
  direction: {
    column: "flex flex-col",
    row: "flex flex-row",
  },
  /** UX-2.26 — Center root. */
  center: "flex items-center justify-center",
  /** UX-2.26 — Spacer root (flex grow). */
  spacer: "flex-1",
  /** UX-2.26 — Cluster root (row + wrap); gap/align via STACK_GAPS / align. */
  cluster: "flex flex-row flex-wrap items-center",
} as const;
