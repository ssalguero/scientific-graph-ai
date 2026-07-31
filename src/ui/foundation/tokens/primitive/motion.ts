import type { MotionScale } from "../types/primitive";

/**
 * Motion primitives — ux/docs/MOTION.md + UI_GOVERNANCE_V3
 * Durations in ms; nothing above 300ms without exception approval.
 */
export const motion = {
  duration: {
    duration100: 100,
    duration150: 150,
    duration200: 200,
    duration250: 250,
    duration300: 300,
  },
  easing: {
    easeOut: "ease-out",
    easeInOut: "ease-in-out",
  },
} as const satisfies MotionScale;
