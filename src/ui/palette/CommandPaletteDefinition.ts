/**
 * UX-6.5 — Command Palette definition (projection identity only).
 *
 * Maps a CommandId into the palette catalog view.
 * No keywords · no handlers · no icons · no React.
 */

import type { CommandId } from "../commands/CommandTypes";

export type CommandPaletteDefinition = Readonly<{
  readonly commandId: CommandId;
}>;

/** Input shape for createCommandPaletteDefinition (freeze-only). */
export type CommandPaletteDefinitionInit = Readonly<{
  commandId: CommandId;
}>;

/**
 * Builds an immutable CommandPaletteDefinition.
 * Applies Object.freeze only — projection entry, not a command owner.
 */
export function createCommandPaletteDefinition(
  init: CommandPaletteDefinitionInit,
): CommandPaletteDefinition {
  return Object.freeze({
    ...init,
  });
}
