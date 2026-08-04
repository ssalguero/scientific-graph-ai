/**
 * UX-6.3 — Immutable Command Execution Result.
 *
 * Structural outcome only — never carries business payloads or errors
 * from real handlers (handlers are out of scope until later phases).
 */

import type { CommandId } from "./CommandTypes";
import type { CommandExecutionStatus } from "./CommandExecutionTypes";

export type CommandExecutionResult = Readonly<{
  readonly commandId: CommandId;
  readonly status: CommandExecutionStatus;
  readonly ok: boolean;
}>;

/** Input shape for createCommandExecutionResult (freeze-only). */
export type CommandExecutionResultInit = Readonly<{
  commandId: CommandId;
  status: CommandExecutionStatus;
  ok: boolean;
}>;

/**
 * Builds an immutable CommandExecutionResult.
 * Applies Object.freeze only — no side effects.
 */
export function createCommandExecutionResult(
  init: CommandExecutionResultInit,
): CommandExecutionResult {
  return Object.freeze({
    ...init,
  });
}
