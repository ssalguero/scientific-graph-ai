import type { SemanticRadiusTokens } from "../types/semantic";
import { createTokenRef } from "../types/references";

/** Semantic radius roles — control default lg (8px), container md, pill full */
export const radius = {
  control: createTokenRef("radius.lg"),
  container: createTokenRef("radius.md"),
  pill: createTokenRef("radius.full"),
} as const satisfies SemanticRadiusTokens;
