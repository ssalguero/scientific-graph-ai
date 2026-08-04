/**
 * UX-6.1 — Command System local barrel.
 * Not re-exported from @/ui (src/ui/index.ts) in this phase.
 */

export type { CommandId } from "./CommandTypes";
export { asCommandId } from "./CommandTypes";

export type {
  CommandDefinition,
  CommandDefinitionInit,
} from "./CommandDefinition";
export { createCommandDefinition } from "./CommandDefinition";

export type { CommandRegistryApi } from "./CommandRegistry";
export {
  EMPTY_COMMAND_DEFINITIONS,
  createCommandRegistry,
  commandRegistry,
} from "./CommandRegistry";

export type { CommandState, CommandStateInit } from "./CommandState";
export { createCommandState } from "./CommandState";

export type { CommandDiagnosticsReport } from "./CommandDiagnostics";
export { createCommandDiagnosticsReport } from "./CommandDiagnostics";
