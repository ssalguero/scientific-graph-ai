/**
 * UX-6.4 — Immutable Shortcut Registry (query-only catalog SSOT).
 *
 * Contract: ShortcutRegistryApi
 * Singleton: shortcutRegistry (built via ShortcutRegistryBuilder)
 *
 * Pure catalog storage — no key resolution (→ ShortcutResolver).
 * No mutators · no findByShortcut · no React · no browser.
 */

import type { ShortcutDefinition } from "./ShortcutDefinition";
import type { ShortcutId } from "./ShortcutTypes";

export const EMPTY_SHORTCUT_DEFINITIONS: readonly ShortcutDefinition[] =
  Object.freeze([]);

/**
 * Query-only registry contract.
 * Named ShortcutRegistryApi to avoid type/value name collision with the singleton.
 */
export interface ShortcutRegistryApi {
  get(id: ShortcutId): ShortcutDefinition | undefined;
  has(id: ShortcutId): boolean;
  size(): number;
  getAll(): readonly ShortcutDefinition[];
}

/**
 * Creates an immutable query-only registry.
 * Assumes valid input — registration validation is build-time only.
 */
export function createShortcutRegistry(
  definitions: readonly ShortcutDefinition[] = EMPTY_SHORTCUT_DEFINITIONS,
): ShortcutRegistryApi {
  const frozenDefinitions = definitions.map((def) =>
    Object.freeze({ ...def }),
  );
  const map = new Map<ShortcutId, ShortcutDefinition>(
    frozenDefinitions.map((def) => [def.id, def]),
  );
  const allDefinitions: readonly ShortcutDefinition[] =
    Object.freeze(frozenDefinitions);

  return Object.freeze({
    get(id: ShortcutId): ShortcutDefinition | undefined {
      return map.get(id);
    },
    has(id: ShortcutId): boolean {
      return map.has(id);
    },
    size(): number {
      return map.size;
    },
    getAll(): readonly ShortcutDefinition[] {
      return allDefinitions;
    },
  });
}
