/**
 * UX-6.3 — Command Execution Context (read-only view for the pipeline).
 *
 * Carries registry + states snapshots for structural dispatch decisions.
 * Does not mutate · does not own · no React.
 */

import type { CommandRegistryApi } from "./CommandRegistry";
import type { CommandId } from "./CommandTypes";
import type { CommandState } from "./CommandState";

export type CommandExecutionContext = Readonly<{
  readonly registry: CommandRegistryApi;
  readonly states: ReadonlyMap<CommandId, CommandState>;
}>;

/**
 * Builds an immutable CommandExecutionContext.
 * Freezes the context object only — registry/states identities preserved.
 */
export function createCommandExecutionContext(
  registry: CommandRegistryApi,
  states: ReadonlyMap<CommandId, CommandState>,
): CommandExecutionContext {
  return Object.freeze({
    registry,
    states,
  });
}
