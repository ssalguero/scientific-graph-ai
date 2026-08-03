/**
 * UX-5.1 — Minimal feature definition (id + category only).
 * Metadata → UX-5.3 · Visibility → UX-5.4 · State → UX-5.5.
 */

import type { FeatureCategory, FeatureId } from "./FeatureTypes";

export type FeatureDefinition = Readonly<{
  id: FeatureId;
  category: FeatureCategory;
}>;
