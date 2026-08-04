/**
 * UX-6.4 — Build-time Shortcut Registration session.
 *
 * Mutable only during build. Discarded after Builder completes.
 * Duplicate ShortcutId or ShortcutKey: skip second entry; record id.
 * No React · no browser · not part of ShortcutRegistryApi.
 */

import type { ShortcutDefinition } from "./ShortcutDefinition";
import type { ShortcutId, ShortcutKey } from "./ShortcutTypes";

export type ShortcutRegistration = Readonly<{
  registerShortcut(definition: ShortcutDefinition): void;
  getDefinitions(): readonly ShortcutDefinition[];
  getDuplicates(): readonly ShortcutId[];
  size(): number;
}>;

/**
 * Creates a build-time registration session with duplicate protection.
 */
export function createShortcutRegistration(): ShortcutRegistration {
  const definitions: ShortcutDefinition[] = [];
  const byId = new Set<ShortcutId>();
  const byKey = new Set<ShortcutKey>();
  const duplicates: ShortcutId[] = [];

  return Object.freeze({
    registerShortcut(definition: ShortcutDefinition): void {
      if (byId.has(definition.id) || byKey.has(definition.key)) {
        duplicates.push(definition.id);
        return;
      }
      byId.add(definition.id);
      byKey.add(definition.key);
      definitions.push(definition);
    },
    getDefinitions(): readonly ShortcutDefinition[] {
      return Object.freeze([...definitions]);
    },
    getDuplicates(): readonly ShortcutId[] {
      return Object.freeze([...duplicates]);
    },
    size(): number {
      return definitions.length;
    },
  });
}
