import type { SemanticElevationTokens } from "../types/semantic";
import { createTokenRef } from "../types/references";

/**
 * Semantic elevation roles — map to shadow primitives (visual depth).
 * Level indices remain in primitive.elevation for numeric hierarchy.
 */
export const elevation = {
  base: createTokenRef("shadow.none"),
  card: createTokenRef("shadow.sm"),
  popover: createTokenRef("shadow.md"),
  dialog: createTokenRef("shadow.lg"),
  floating: createTokenRef("shadow.xl"),
} as const satisfies SemanticElevationTokens;
