import type { SpacingScale } from "../types/primitive";

/**
 * Spacing scale (px) — ux/docs/SPACING.md
 * Doc token space-N ↔ TS key spaceN
 */
export const spacing = {
  space0: 0,
  space1: 4,
  space2: 8,
  space3: 12,
  space4: 16,
  space5: 20,
  space6: 24,
  space8: 32,
  space10: 40,
  space12: 48,
  space16: 64,
  space20: 80,
  space24: 96,
} as const satisfies SpacingScale;
