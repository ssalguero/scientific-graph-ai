/**
 * UX-2.9 — Frozen resize limits.
 * MIN_* aligned with PANEL_MIN_SIZE (180). No React. No dock token imports.
 */

import type { ResizeConstraintSet } from "./ResizeTypes";

/** Aligned with UX-2.7 PANEL_MIN_SIZE. */
export const MIN_LEFT = 180;
export const MAX_LEFT = 480;

export const MIN_RIGHT = 180;
export const MAX_RIGHT = 480;

export const MIN_BOTTOM = 180;
export const MAX_BOTTOM = 480;

/** Splitter hit target size (px). */
export const HANDLE_SIZE = 4;

/** Frozen bag passed into ResizeMath.computeNextSize. */
export const RESIZE_CONSTRAINTS: ResizeConstraintSet = {
  MIN_LEFT,
  MAX_LEFT,
  MIN_RIGHT,
  MAX_RIGHT,
  MIN_BOTTOM,
  MAX_BOTTOM,
  HANDLE_SIZE,
};
