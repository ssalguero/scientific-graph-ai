/**
 * UX-6.4 — Shortcut definition (identity only).
 * Maps a normalized ShortcutKey to a CommandId.
 * No handlers · no browser · no React.
 */

import type { CommandId } from "../commands/CommandTypes";
import type { ShortcutId, ShortcutKey } from "./ShortcutTypes";

export type ShortcutDefinition = Readonly<{
  readonly id: ShortcutId;
  readonly key: ShortcutKey;
  readonly commandId: CommandId;
}>;

/** Input shape for createShortcutDefinition (freeze-only). */
export type ShortcutDefinitionInit = Readonly<{
  id: ShortcutId;
  key: ShortcutKey;
  commandId: CommandId;
}>;

/**
 * Builds an immutable ShortcutDefinition.
 * Applies Object.freeze only — identity catalog entry.
 */
export function createShortcutDefinition(
  init: ShortcutDefinitionInit,
): ShortcutDefinition {
  return Object.freeze({
    ...init,
  });
}
