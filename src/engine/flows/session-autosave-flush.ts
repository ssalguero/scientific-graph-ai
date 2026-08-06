/**
 * Product Flow — Session Autosave Flush (orchestration request).
 * OWNERSHIP: ENGINE
 * Requests flush via SessionCoordinator — does not own AutosaveScheduler.
 */

import type { SessionCoordinator } from "../coordination/session/SessionCoordinator";
import type { WorkflowDefinition } from "../orchestration/definition";
import type { WorkflowExecutionContext } from "../orchestration/context";

export const FLOW_ID = "sessionAutosaveFlush" as const;

export const SESSION_AUTOSAVE_FLUSH_COMMAND_ID =
  "session.autosave.flush" as const;

/** Build a WorkflowDefinition bound to a SessionCoordinator instance. */
export function createSessionAutosaveFlushFlow(
  sessionCoordinator: SessionCoordinator,
): WorkflowDefinition {
  return {
    id: FLOW_ID,
    execute: async (ctx: WorkflowExecutionContext) => {
      ctx.diagnostics.record({
        operationId: ctx.operationId,
        workflowId: FLOW_ID,
        state: ctx.state,
        stage: "execution",
        message: "session.autosave.flush requested",
      });
      await sessionCoordinator.requestAutosaveFlush({
        operationId: ctx.operationId,
        flowId: FLOW_ID,
        reason: "product-flow",
      });
      ctx.result = {
        flushed: true,
        status: sessionCoordinator.getAutosaveStatus(),
      };
    },
  };
}
