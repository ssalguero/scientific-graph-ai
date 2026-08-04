/**
 * UX-6.3 — Command Execution Pipeline foundation types.
 *
 * Request identity only — no handlers, no business payload, no React.
 * Real business dispatch → later phases; this phase is structural only.
 */

import type { CommandId } from "./CommandTypes";

/**
 * Structural outcome of a pipeline dispatch.
 * "acknowledged" means the pipeline accepted the request without
 * running business logic (no handlers · no app mutation).
 */
export type CommandExecutionStatus =
  | "notFound"
  | "notEnabled"
  | "acknowledged";

/** Immutable execution request (command identity only). */
export type CommandExecutionRequest = Readonly<{
  readonly commandId: CommandId;
}>;

/** Input shape for createCommandExecutionRequest (freeze-only). */
export type CommandExecutionRequestInit = Readonly<{
  commandId: CommandId;
}>;

/**
 * Builds an immutable CommandExecutionRequest.
 * Applies Object.freeze only — no side effects.
 */
export function createCommandExecutionRequest(
  init: CommandExecutionRequestInit,
): CommandExecutionRequest {
  return Object.freeze({
    ...init,
  });
}
