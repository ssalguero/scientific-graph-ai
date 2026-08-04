/**
 * UX-6.3 — Internal Command Execution Dispatcher (structural only).
 *
 * Resolves request against registry + state flags.
 * Never invokes handlers · never mutates app state · never runs business logic.
 */

import { createCommandExecutionResult } from "./CommandExecutionResult";
import type { CommandExecutionContext } from "./CommandExecutionContext";
import type { CommandExecutionRequest } from "./CommandExecutionTypes";
import type { CommandExecutionResult } from "./CommandExecutionResult";

export type CommandExecutionDispatcher = Readonly<{
  dispatch(
    request: CommandExecutionRequest,
    context: CommandExecutionContext,
  ): CommandExecutionResult;
}>;

/**
 * Creates the internal structural dispatcher.
 * Outcome is acknowledgment / rejection only — no business side effects.
 */
export function createCommandExecutionDispatcher(): CommandExecutionDispatcher {
  return Object.freeze({
    dispatch(
      request: CommandExecutionRequest,
      context: CommandExecutionContext,
    ): CommandExecutionResult {
      const { commandId } = request;

      if (!context.registry.has(commandId)) {
        return createCommandExecutionResult({
          commandId,
          status: "notFound",
          ok: false,
        });
      }

      const state = context.states.get(commandId);
      if (state !== undefined && !state.enabled) {
        return createCommandExecutionResult({
          commandId,
          status: "notEnabled",
          ok: false,
        });
      }

      return createCommandExecutionResult({
        commandId,
        status: "acknowledged",
        ok: true,
      });
    },
  });
}
