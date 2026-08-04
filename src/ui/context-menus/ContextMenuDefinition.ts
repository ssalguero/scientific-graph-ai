/**
 * UX-6.8 — Context Menu definition (structural identity only).
 *
 * Maps a ContextMenuId to an ordered list of CommandId items.
 * No handlers · no icons · no React · no execution.
 */

import type { CommandId } from "../commands/CommandTypes";
import type { ContextMenuId } from "./ContextMenuTypes";

export type ContextMenuItem = Readonly<{
  readonly commandId: CommandId;
}>;

export type ContextMenuDefinition = Readonly<{
  readonly id: ContextMenuId;
  readonly items: readonly ContextMenuItem[];
}>;

/** Input shape for createContextMenuItem (freeze-only). */
export type ContextMenuItemInit = Readonly<{
  commandId: CommandId;
}>;

/** Input shape for createContextMenuDefinition (freeze-only). */
export type ContextMenuDefinitionInit = Readonly<{
  id: ContextMenuId;
  items: readonly ContextMenuItemInit[];
}>;

/**
 * Builds an immutable ContextMenuItem.
 * Applies Object.freeze only — structural reference, not a command owner.
 */
export function createContextMenuItem(
  init: ContextMenuItemInit,
): ContextMenuItem {
  return Object.freeze({
    ...init,
  });
}

/**
 * Builds an immutable ContextMenuDefinition.
 * Freezes the definition and its items array — identity catalog entry.
 */
export function createContextMenuDefinition(
  init: ContextMenuDefinitionInit,
): ContextMenuDefinition {
  const items = Object.freeze(
    init.items.map((item) => createContextMenuItem(item)),
  );
  return Object.freeze({
    id: init.id,
    items,
  });
}
