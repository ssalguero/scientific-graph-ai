import type { SemanticFocusTokens } from "../types/semantic";
import { createTokenRef } from "../types/references";

/**
 * Semantic focus tokens — meaning only; refs → primitive.
 * Default light mapping. Theme swaps belong to Theme Maps (UX-3.1.3).
 * Width/offset use radius.xs (2px) aligned to ACCESSIBILITY.md outline example.
 */
export const focus = {
  ringColor: createTokenRef("color.blue.600"),
  ringWidth: createTokenRef("radius.xs"),
  ringOffset: createTokenRef("radius.xs"),
} as const satisfies SemanticFocusTokens;
