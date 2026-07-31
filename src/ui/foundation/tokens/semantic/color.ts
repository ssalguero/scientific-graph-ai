import type { SemanticColorTokens } from "../types/semantic";
import { createTokenRef } from "../types/references";

/**
 * Semantic color tokens — meaning only; refs → primitive.color.*
 * Default light mapping as data. Theme swaps belong to UX-3.1.3.
 */
export const color = {
  surface: {
    canvas: createTokenRef("color.slate.50"),
    default: createTokenRef("color.white"),
    raised: createTokenRef("color.white"),
    overlay: createTokenRef("color.slate.900"),
    floating: createTokenRef("color.white"),
    inverse: createTokenRef("color.slate.900"),
  },
  text: {
    primary: createTokenRef("color.slate.900"),
    secondary: createTokenRef("color.slate.700"),
    muted: createTokenRef("color.slate.500"),
    disabled: createTokenRef("color.slate.400"),
    inverse: createTokenRef("color.white"),
  },
  border: {
    default: createTokenRef("color.slate.200"),
    subtle: createTokenRef("color.slate.100"),
    muted: createTokenRef("color.slate.300"),
    danger: createTokenRef("color.red.500"),
  },
  brand: {
    primary: createTokenRef("color.blue.600"),
    secondary: createTokenRef("color.blue.500"),
    hover: createTokenRef("color.blue.700"),
    active: createTokenRef("color.blue.800"),
  },
  feedback: {
    success: createTokenRef("color.green.600"),
    warning: createTokenRef("color.amber.500"),
    danger: createTokenRef("color.red.600"),
    info: createTokenRef("color.blue.500"),
  },
} as const satisfies SemanticColorTokens;
