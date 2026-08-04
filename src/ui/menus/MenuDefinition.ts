/**
 * UX-6.6 — Menu definition (structural identity only).
 *
 * Maps a MenuId + title to an ordered list of CommandId entries.
 * No handlers · no icons · no React · no execution.
 */

import type { CommandId } from "../commands/CommandTypes";
import type { MenuId } from "./MenuTypes";

export type MenuEntry = Readonly<{
  readonly commandId: CommandId;
}>;

export type MenuDefinition = Readonly<{
  readonly id: MenuId;
  readonly title: string;
  readonly entries: readonly MenuEntry[];
}>;

/** Input shape for createMenuEntry (freeze-only). */
export type MenuEntryInit = Readonly<{
  commandId: CommandId;
}>;

/** Input shape for createMenuDefinition (freeze-only). */
export type MenuDefinitionInit = Readonly<{
  id: MenuId;
  title: string;
  entries: readonly MenuEntryInit[];
}>;

/**
 * Builds an immutable MenuEntry.
 * Applies Object.freeze only — structural reference, not a command owner.
 */
export function createMenuEntry(init: MenuEntryInit): MenuEntry {
  return Object.freeze({
    ...init,
  });
}

/**
 * Builds an immutable MenuDefinition.
 * Freezes the definition and its entries array — identity catalog entry.
 */
export function createMenuDefinition(
  init: MenuDefinitionInit,
): MenuDefinition {
  const entries = Object.freeze(
    init.entries.map((entry) => createMenuEntry(entry)),
  );
  return Object.freeze({
    id: init.id,
    title: init.title,
    entries,
  });
}
