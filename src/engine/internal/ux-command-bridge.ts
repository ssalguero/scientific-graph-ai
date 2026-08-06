/**
 * ENGINE Domain — UX command intention bridge (plain DTOs only).
 * OWNERSHIP: ENGINE-side adapter from serializable UX-style intentions → EngineCommandRequest.
 * ENGINE-3: Architectural bridge only — no React, no `@/ui` imports, no app wiring.
 *
 * Two-layer model:
 *   UX interaction (UX-6) → (this mapper) → CommandOrchestrator → WorkflowEngine.run
 *
 * Consumers outside ENGINE must not import this path — use `@/engine` `executeCommand`
 * with an `EngineCommandRequest`-shaped call, or map locally.
 */

import type {
  EngineCommandContext,
  EngineCommandRequest,
  EngineCommandResult,
} from "../contracts/commands";

/**
 * Plain serializable UX-style business command intention.
 * Mirrors UX-6 request identity + optional payload/context without importing `@/ui`.
 */
export interface UxCommandIntention {
  readonly commandId: string;
  readonly payload?: unknown;
  readonly source?: string;
  readonly correlationId?: string;
}

/** Map a plain UX-style intention to an ENGINE command request DTO. */
export function toEngineCommandRequest(
  intention: UxCommandIntention,
): EngineCommandRequest {
  const context: EngineCommandContext | undefined =
    intention.source !== undefined || intention.correlationId !== undefined
      ? {
          source: intention.source,
          correlationId: intention.correlationId,
        }
      : undefined;

  return {
    commandId: intention.commandId,
    payload: intention.payload,
    context,
  };
}

/**
 * Convenience: map intention then execute via a provided executor
 * (typically `orchestrator.execute` or public `executeCommand`).
 */
export async function bridgeUxCommandIntention(
  intention: UxCommandIntention,
  execute: (
    commandId: string,
    payload?: unknown,
    context?: EngineCommandContext,
  ) => Promise<EngineCommandResult>,
): Promise<EngineCommandResult> {
  const request = toEngineCommandRequest(intention);
  return execute(request.commandId, request.payload, request.context);
}
