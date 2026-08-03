/**
 * UX-5.1 — Feature Registry local barrel.
 * Not re-exported from @/ui (src/ui/index.ts) in this phase.
 */

export type { FeatureId, FeatureCategory } from "./FeatureTypes";
export {
  asFeatureId,
  FEATURE_CATEGORIES,
  FEATURE_CATEGORY_IDS,
} from "./FeatureTypes";

export type { FeatureDefinition } from "./FeatureDefinition";

export type { FeatureRegistry } from "./FeatureRegistry";
export {
  EMPTY_FEATURE_DEFINITIONS,
  createFeatureRegistry,
  featureRegistry,
} from "./FeatureRegistry";
