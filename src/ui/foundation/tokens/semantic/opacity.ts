import type { SemanticOpacityTokens } from "../types/semantic";
import { createTokenRef } from "../types/references";

export const opacity = {
  disabled: createTokenRef("opacity.opacity40"),
  overlay: createTokenRef("opacity.opacity60"),
} as const satisfies SemanticOpacityTokens;
