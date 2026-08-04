/**
 * UX-6.7 — Toolbar definition (structural identity only).
 *
 * Maps a ToolbarId to an ordered list of CommandId items.
 * No handlers · no icons · no React · no execution.
 */

import type { CommandId } from "../commands/CommandTypes";
import type { ToolbarId } from "./ToolbarTypes";

export type ToolbarItem = Readonly<{
  readonly commandId: CommandId;
}>;

export type ToolbarDefinition = Readonly<{
  readonly id: ToolbarId;
  readonly items: readonly ToolbarItem[];
}>;

/** Input shape for createToolbarItem (freeze-only). */
export type ToolbarItemInit = Readonly<{
  commandId: CommandId;
}>;

/** Input shape for createToolbarDefinition (freeze-only). */
export type ToolbarDefinitionInit = Readonly<{
  id: ToolbarId;
  items: readonly ToolbarItemInit[];
}>;

/**
 * Builds an immutable ToolbarItem.
 * Applies Object.freeze only — structural reference, not a command owner.
 */
export function createToolbarItem(init: ToolbarItemInit): ToolbarItem {
  return Object.freeze({
    ...init,
  });
}

/**
 * Builds an immutable ToolbarDefinition.
 * Freezes the definition and its items array — identity catalog entry.
 */
export function createToolbarDefinition(
  init: ToolbarDefinitionInit,
): ToolbarDefinition {
  const items = Object.freeze(
    init.items.map((item) => createToolbarItem(item)),
  );
  return Object.freeze({
    id: init.id,
    items,
  });
}
