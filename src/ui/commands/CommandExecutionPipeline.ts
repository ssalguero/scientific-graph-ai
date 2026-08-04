/**
 * UX-6.3 — Command Execution Pipeline (structural orchestration).
 *
 * Owns a frozen context + internal dispatcher.
 * Entry point: dispatch(request) → CommandExecutionResult.
 * No handlers · no business logic · no React · no product wiring.
 */

import { createCommandExecutionDispatcher } from "./CommandExecutionDispatcher";
import type { CommandExecutionContext } from "./CommandExecutionContext";
import type { CommandExecutionDispatcher } from "./CommandExecutionDispatcher";
import type { CommandExecutionRequest } from "./CommandExecutionTypes";
import type { CommandExecutionResult } from "./CommandExecutionResult";

export type CommandExecutionPipeline = Readonly<{
  dispatch(request: CommandExecutionRequest): CommandExecutionResult;
  getContext(): CommandExecutionContext;
}>;

/**
 * Creates an immutable execution pipeline bound to a context.
 * Dispatcher defaults to the structural internal dispatcher.
 */
export function createCommandExecutionPipeline(
  context: CommandExecutionContext,
  dispatcher: CommandExecutionDispatcher = createCommandExecutionDispatcher(),
): CommandExecutionPipeline {
  const frozenContext = context;

  return Object.freeze({
    dispatch(request: CommandExecutionRequest): CommandExecutionResult {
      return dispatcher.dispatch(request, frozenContext);
    },
    getContext(): CommandExecutionContext {
      return frozenContext;
    },
  });
}
