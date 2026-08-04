/**
 * UX-6.1 / UX-6.3 — Command Diagnostics (pure structural report).
 *
 * Pure TypeScript · no React · no Runtime · no side effects.
 * Inspects registry size/ids, state enabled/visible lists, and pipeline readiness.
 */

import type { CommandRegistryApi } from "./CommandRegistry";
import type { CommandId } from "./CommandTypes";
import type { CommandState } from "./CommandState";
import type { CommandExecutionPipeline } from "./CommandExecutionPipeline";

export type CommandDiagnosticsReport = Readonly<{
  count: number;
  ids: readonly CommandId[];
  enabled: readonly CommandId[];
  visible: readonly CommandId[];
  pipelineReady: boolean;
}>;

/**
 * Builds an immutable diagnostics report from registry + states + optional pipeline.
 * Pure function — no class, no mutation, no side effects.
 */
export function createCommandDiagnosticsReport(
  registry: CommandRegistryApi,
  states: ReadonlyMap<CommandId, CommandState>,
  pipeline?: CommandExecutionPipeline | null,
): CommandDiagnosticsReport {
  const definitions = registry.getAll();
  const ids = Object.freeze(definitions.map((def) => def.id));

  const enabled: CommandId[] = [];
  const visible: CommandId[] = [];
  for (const state of states.values()) {
    if (state.enabled) enabled.push(state.id);
    if (state.visible) visible.push(state.id);
  }

  return Object.freeze({
    count: registry.size(),
    ids,
    enabled: Object.freeze(enabled),
    visible: Object.freeze(visible),
    pipelineReady: pipeline != null,
  });
}
