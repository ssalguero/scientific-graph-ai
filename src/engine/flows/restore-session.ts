/**
 * Product Flow — Restore Session.
 * OWNERSHIP: ENGINE
 * Orchestrates SessionCoordinator.restoreSession via WorkflowEngine execution stage.
 * Session Platform remains authoritative for restore mechanics (SessionRestoreEngine).
 */

import {
  SESSION_ERROR_CODES,
  SessionFlowError,
} from "../coordination/session/errors";
import type { SessionCoordinator } from "../coordination/session/SessionCoordinator";
import type {
  RestoreSessionInput,
  SessionRegistryHandle,
} from "../coordination/session/types";
import type { WorkflowDefinition } from "../orchestration/definition";
import type { WorkflowExecutionContext } from "../orchestration/context";

export const FLOW_ID = "restoreSession" as const;

export const SESSION_RESTORE_COMMAND_ID = "session.restore" as const;

function parseRestorePayload(payload: unknown): RestoreSessionInput {
  if (payload == null || typeof payload !== "object") {
    throw new SessionFlowError(
      SESSION_ERROR_CODES.INVALID_PAYLOAD,
      "restoreSession requires payload { records, registry }",
    );
  }
  const record = payload as Record<string, unknown>;
  if (!Array.isArray(record.records)) {
    throw new SessionFlowError(
      SESSION_ERROR_CODES.INVALID_PAYLOAD,
      "restoreSession requires payload.records: array",
    );
  }
  const registry = record.registry as SessionRegistryHandle | undefined;
  if (registry == null || typeof registry.register !== "function") {
    throw new SessionFlowError(
      SESSION_ERROR_CODES.INVALID_PAYLOAD,
      "restoreSession requires payload.registry with register()",
    );
  }
  return {
    records: record.records,
    registry,
  };
}

/** Build a WorkflowDefinition bound to a SessionCoordinator instance. */
export function createRestoreSessionFlow(
  sessionCoordinator: SessionCoordinator,
): WorkflowDefinition {
  return {
    id: FLOW_ID,
    execute: async (ctx: WorkflowExecutionContext) => {
      const input = parseRestorePayload(ctx.payload);
      ctx.diagnostics.record({
        operationId: ctx.operationId,
        workflowId: FLOW_ID,
        state: ctx.state,
        stage: "execution",
        message: `restoreSession records=${input.records.length}`,
      });
      const result = await sessionCoordinator.restoreSession(input, {
        operationId: ctx.operationId,
        flowId: FLOW_ID,
        reason: "product-flow",
      });
      ctx.result = result;
    },
  };
}
