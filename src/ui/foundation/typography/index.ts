import { primitive, semantic } from "../tokens";

/** Domain facade — typography primitive + semantic slices (no local values). */
export const typography = {
  primitive: primitive.typography,
  semantic: semantic.typography,
} as const;
