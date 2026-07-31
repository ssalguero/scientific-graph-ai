import { primitive, semantic } from "../tokens";

/** Domain facade — elevation + shadow (no local values). */
export const elevation = {
  primitive: {
    elevation: primitive.elevation,
    shadow: primitive.shadow,
  },
  semantic: semantic.elevation,
} as const;
