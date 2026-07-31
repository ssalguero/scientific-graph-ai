import { primitive, semantic } from "../tokens";

/** Domain facade — spacing primitive + semantic slices (no local values). */
export const spacing = {
  primitive: primitive.spacing,
  semantic: semantic.spacing,
} as const;
