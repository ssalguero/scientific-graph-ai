/**
 * UX-6.1 — Runtime command state (immutable snapshot).
 *
 * CommandState represents an immutable snapshot of conceptually mutable
 * runtime flags. The object is frozen; future evolution replaces snapshots
 * and never mutates the same object in place.
 *
 * Separated from CommandDefinition (identity) and CommandRegistryApi (SSOT).
 */

import type { CommandId } from "./CommandTypes";

export type CommandState = Readonly<{
  readonly id: CommandId;
  readonly enabled: boolean;
  readonly visible: boolean;
}>;

/** Input shape for createCommandState (freeze-only). */
export type CommandStateInit = Readonly<{
  id: CommandId;
  enabled: boolean;
  visible: boolean;
}>;

/**
 * Builds an immutable CommandState snapshot.
 * Applies Object.freeze only — no collections.
 */
export function createCommandState(init: CommandStateInit): CommandState {
  return Object.freeze({
    ...init,
  });
}
