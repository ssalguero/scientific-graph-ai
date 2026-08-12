/** UX-2.7 — Panel visual state (collapsed + sizes). Reserved for UX-2.8 ResizeHandle. */
export type PanelId = "left" | "right" | "bottom";

/** UX-2.7 — Panel layout visual state (no persistence). */
export interface PanelState {
  leftCollapsed: boolean;
  rightCollapsed: boolean;
  bottomCollapsed: boolean;
  leftWidth: number;
  rightWidth: number;
  bottomHeight: number;
}

/**
 * UX-2.7 — Frozen defaults (hardcoded; do not import dock tokens).
 * UX-2.10 — Synced with PlanningMode.apply() (280 / 280 / 240).
 * CRP-6.2 — Commercial defaults collapse L/R/B (scaffold available via expand rails).
 */
export const DEFAULT_PANEL_STATE: Readonly<PanelState> = {
  leftCollapsed: true,
  rightCollapsed: true,
  bottomCollapsed: true,
  leftWidth: 280,
  rightWidth: 280,
  bottomHeight: 240,
};

/** UX-2.7 — Minimum size for width/height setters (no max). */
export const PANEL_MIN_SIZE = 180;
