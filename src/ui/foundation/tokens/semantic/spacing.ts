import type { SemanticSpacingTokens } from "../types/semantic";
import { createTokenRef } from "../types/references";

/** Semantic spacing roles — ux/docs/SPACING.md usage names */
export const spacing = {
  none: createTokenRef("spacing.space0"),
  micro: createTokenRef("spacing.space1"),
  tight: createTokenRef("spacing.space2"),
  compact: createTokenRef("spacing.space3"),
  default: createTokenRef("spacing.space4"),
  medium: createTokenRef("spacing.space5"),
  comfortable: createTokenRef("spacing.space6"),
  large: createTokenRef("spacing.space8"),
  extraLarge: createTokenRef("spacing.space10"),
  section: createTokenRef("spacing.space12"),
  major: createTokenRef("spacing.space16"),
  screen: createTokenRef("spacing.space20"),
  layout: createTokenRef("spacing.space24"),
} as const satisfies SemanticSpacingTokens;
