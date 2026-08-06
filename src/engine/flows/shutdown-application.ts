/**
 * Product Flow — Shutdown Application.
 * OWNERSHIP: ENGINE
 * Orchestrates LifecycleCoordinator.shutdownApplication via WorkflowEngine.
 */

import type { LifecycleCoordinator } from "../orchestration/LifecycleCoordinator";
import type { WorkflowDefinition } from "../orchestration/definition";
import type { WorkflowExecutionContext } from "../orchestration/context";

export const FLOW_ID = "shutdownApplication" as const;

export const APP_SHUTDOWN_COMMAND_ID = "app.shutdown" as const;

/** Build a WorkflowDefinition bound to a LifecycleCoordinator instance. */
export function createShutdownApplicationFlow(
  lifecycleCoordinator: LifecycleCoordinator,
): WorkflowDefinition {
  return {
    id: FLOW_ID,
    execute: async (ctx: WorkflowExecutionContext) => {
      ctx.diagnostics.record({
        operationId: ctx.operationId,
        workflowId: FLOW_ID,
        state: ctx.state,
        stage: "execution",
        message: "shutdownApplication",
      });
      await lifecycleCoordinator.shutdownApplication(ctx.payload);
      ctx.result = {
        phase: lifecycleCoordinator.getPhase(),
      };
    },
  };
}
