/**
 * UX-6.1 — Command definition (identity only).
 * Runtime flags (enabled / visible) live on CommandState.
 * Registration of production commands → UX-6.2.
 */

import type { CommandId } from "./CommandTypes";

export type CommandDefinition = Readonly<{
  readonly id: CommandId;
}>;

/** Input shape for createCommandDefinition (freeze-only). */
export type CommandDefinitionInit = Readonly<{
  id: CommandId;
}>;

/**
 * Builds an immutable CommandDefinition.
 * Applies Object.freeze only — identity catalog entry.
 */
export function createCommandDefinition(
  init: CommandDefinitionInit,
): CommandDefinition {
  return Object.freeze({
    ...init,
  });
}
