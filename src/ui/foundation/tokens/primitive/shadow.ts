import type { ShadowScale } from "../types/primitive";

/** Shadow scale — ux/docs/SHADOWS.md */
export const shadow = {
  none: "none",
  sm: "0 1px 2px rgba(0,0,0,0.05)",
  md: "0 4px 8px rgba(0,0,0,0.08)",
  lg: "0 10px 20px rgba(0,0,0,0.12)",
  xl: "0 20px 40px rgba(0,0,0,0.16)",
} as const satisfies ShadowScale;
