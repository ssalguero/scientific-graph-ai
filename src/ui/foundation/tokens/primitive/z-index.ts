import type { ZIndexScale } from "../types/primitive";

/** Z-index scale — layout / overlay stacking */
export const zIndex = {
  base: 0,
  dropdown: 10,
  sticky: 20,
  modal: 30,
  toast: 40,
  max: 50,
} as const satisfies ZIndexScale;
