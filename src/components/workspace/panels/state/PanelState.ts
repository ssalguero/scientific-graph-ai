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

/** UX-2.7 — Frozen defaults (hardcoded; do not import dock tokens). */
export const DEFAULT_PANEL_STATE: Readonly<PanelState> = {
  leftCollapsed: false,
  rightCollapsed: false,
  bottomCollapsed: false,
  leftWidth: 280,
  rightWidth: 320,
  bottomHeight: 240,
};

/** UX-2.7 — Minimum size for width/height setters (no max). */
export const PANEL_MIN_SIZE = 180;
