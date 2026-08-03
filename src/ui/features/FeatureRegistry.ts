/**
 * UX-5.1 — Immutable Feature Registry (query-only SSOT).
 * Discovery (getAll / byCategory / find / enabled) → UX-5.2.
 * Diagnostics (duplicate / invalid ids) → UX-5.9.
 */

import type { FeatureDefinition } from "./FeatureDefinition";
import type { FeatureId } from "./FeatureTypes";

export const EMPTY_FEATURE_DEFINITIONS: readonly FeatureDefinition[] =
  Object.freeze([]);

export type FeatureRegistry = Readonly<{
  get(id: FeatureId): FeatureDefinition | undefined;
  has(id: FeatureId): boolean;
  size(): number;
}>;

/**
 * Creates an immutable query-only registry.
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
  });
}

/** Empty singleton SSOT for UX-5.1 bootstrap. */
export const featureRegistry: FeatureRegistry = createFeatureRegistry();
