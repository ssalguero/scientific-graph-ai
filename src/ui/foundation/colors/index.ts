import { primitive, semantic } from "../tokens";

/** Domain facade — color primitive + semantic slices (no local values). */
export const colors = {
  primitive: primitive.color,
  semantic: semantic.color,
} as const;
