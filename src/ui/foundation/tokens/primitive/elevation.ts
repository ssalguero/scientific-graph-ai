import type { ElevationScale } from "../types/primitive";

/** Elevation levels 0–4 — ux/docs/ELEVATION.md */
export const elevation = {
  level0: 0,
  level1: 1,
  level2: 2,
  level3: 3,
  level4: 4,
} as const satisfies ElevationScale;
