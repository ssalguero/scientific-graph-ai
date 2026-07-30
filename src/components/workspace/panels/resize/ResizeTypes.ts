/** UX-2.9 — Frozen resize axis + session types (no React). */

export type ResizeAxis = "left" | "right" | "bottom";

/**
 * UX-2.9 — Frozen drag session.
 * startSize is captured once at beginResize; never mutate during drag.
 * Always compute next from startSize + delta — never currentSize + delta.
 */
export interface ResizeSession {
  axis: ResizeAxis;
  pointerId: number;
  startClient: number;
  startSize: number;
}

/** UX-2.9 — Frozen constraint bag consumed by ResizeMath. */
export interface ResizeConstraintSet {
  MIN_LEFT: number;
  MAX_LEFT: number;
  MIN_RIGHT: number;
  MAX_RIGHT: number;
  MIN_BOTTOM: number;
  MAX_BOTTOM: number;
  HANDLE_SIZE: number;
}
