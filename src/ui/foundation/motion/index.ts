import { primitive, semantic } from "../tokens";

/** Domain facade — motion primitive + semantic slices (no local values). */
export const motion = {
  primitive: primitive.motion,
  semantic: semantic.motion,
} as const;
