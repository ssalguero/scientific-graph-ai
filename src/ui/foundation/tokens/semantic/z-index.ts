import type { SemanticZIndexTokens } from "../types/semantic";
import { createTokenRef } from "../types/references";

export const zIndex = {
  dropdown: createTokenRef("zIndex.dropdown"),
  sticky: createTokenRef("zIndex.sticky"),
  modal: createTokenRef("zIndex.modal"),
  toast: createTokenRef("zIndex.toast"),
} as const satisfies SemanticZIndexTokens;
