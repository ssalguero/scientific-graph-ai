/**
 * UX-5.2 — Immutable Feature Registry (query-only SSOT + discovery).
 * Metadata → UX-5.3 · Visibility → UX-5.4 · State → UX-5.5.
 * Diagnostics (duplicate / invalid ids) → UX-5.9.
 */

import type { FeatureDefinition } from "./FeatureDefinition";
import type { FeatureCategory, FeatureId } from "./FeatureTypes";

export const EMPTY_FEATURE_DEFINITIONS: readonly FeatureDefinition[] =
  Object.freeze([]);

export type FeatureRegistry = Readonly<{
  get(id: FeatureId): FeatureDefinition | undefined;
  has(id: FeatureId): boolean;
  size(): number;
  getAll(): readonly FeatureDefinition[];
  byCategory(category: FeatureCategory): readonly FeatureDefinition[];
  find(
    predicate: (feature: FeatureDefinition) => boolean,
  ): readonly FeatureDefinition[];
  enabled(): readonly FeatureDefinition[];
}>;

/**
 * Creates an immutable query-only registry with discovery.
 * Assumes valid input — ID / category validation is UX-5.9.
 */
export function createFeatureRegistry(
  definitions: readonly FeatureDefinition[] = EMPTY_FEATURE_DEFINITIONS,
): FeatureRegistry {
  const frozenDefinitions = definitions.map((def) =>
    Object.freeze({ ...def }),
  );
  const map = new Map<FeatureId, FeatureDefinition>(
    frozenDefinitions.map((def) => [def.id, def]),
  );
  const allDefinitions: readonly FeatureDefinition[] =
    Object.freeze(frozenDefinitions);

  return Object.freeze({
    get(id: FeatureId): FeatureDefinition | undefined {
      return map.get(id);
    },
    has(id: FeatureId): boolean {
      return map.has(id);
    },
    size(): number {
      return map.size;
    },
    getAll(): readonly FeatureDefinition[] {
      return allDefinitions;
    },
    byCategory(category: FeatureCategory): readonly FeatureDefinition[] {
      return Object.freeze(
        allDefinitions.filter((feature) => feature.category === category),
      );
    },
    find(
      predicate: (feature: FeatureDefinition) => boolean,
    ): readonly FeatureDefinition[] {
      return Object.freeze(allDefinitions.filter(predicate));
    },
    enabled(): readonly FeatureDefinition[] {
      return this.getAll();
    },
  });
}

/** Empty singleton SSOT for UX-5 bootstrap. */
export const featureRegistry: FeatureRegistry = createFeatureRegistry();
