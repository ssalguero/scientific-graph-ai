/**
 * UX-6.4 — Shortcut Resolver (ShortcutKey → CommandId).
 *
 * Sole owner of key-resolution logic.
 * Builds a private index from registry.getAll() at construction time.
 * No execution · no dispatch · no browser · no React.
 */

import type { CommandId } from "../commands/CommandTypes";
import type { ShortcutRegistryApi } from "./ShortcutRegistry";
import type { ShortcutKey } from "./ShortcutTypes";

export type ShortcutResolver = Readonly<{
  resolve(key: ShortcutKey): CommandId | undefined;
}>;

/**
 * Creates an immutable resolver with a private ShortcutKey → CommandId index.
 */
export function createShortcutResolver(
  registry: ShortcutRegistryApi,
): ShortcutResolver {
  const index = new Map<ShortcutKey, CommandId>();
  for (const definition of registry.getAll()) {
    index.set(definition.key, definition.commandId);
  }

  return Object.freeze({
    resolve(key: ShortcutKey): CommandId | undefined {
      return index.get(key);
    },
  });
}
