/**
 * UX-7.1 — Mutable Visibility Registry (SSOT).
 *
 * Contract: VisibilityRegistryApi (Registry Freeze)
 * Singleton: visibilityRegistry (empty by design — no production entries)
 *
 * Official methods only: register / get / getAll / clear.
 * No React · no render · no UI state.
 */

import type { VisibilityDefinition } from "./VisibilityDefinition";
import type { VisibilityId } from "./VisibilityTypes";

/**
 * Mutable registry contract — Registry Freeze UX-7.1.
 * Named VisibilityRegistryApi to avoid type/value name collision with the singleton.
 */
export interface VisibilityRegistryApi {
  register(definition: VisibilityDefinition): void;
  get(id: VisibilityId): VisibilityDefinition | undefined;
  getAll(): readonly VisibilityDefinition[];
  clear(): void;
}

/**
 * Creates a mutable visibility registry (upsert Map SSOT).
 * Assumes definitions are already frozen by createVisibilityDefinition.
 */
export function createVisibilityRegistry(): VisibilityRegistryApi {
  const map = new Map<VisibilityId, VisibilityDefinition>();

  return Object.freeze({
    register(definition: VisibilityDefinition): void {
      map.set(definition.id, definition);
    },
    get(id: VisibilityId): VisibilityDefinition | undefined {
      return map.get(id);
    },
    getAll(): readonly VisibilityDefinition[] {
      return Object.freeze([...map.values()]);
    },
    clear(): void {
      map.clear();
    },
  });
}

/** Empty singleton SSOT for UX-7.1 bootstrap (empty by design). */
export const visibilityRegistry: VisibilityRegistryApi =
  createVisibilityRegistry();
