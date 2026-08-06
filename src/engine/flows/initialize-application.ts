/**
 * Product Flow — Initialize Application.
 * OWNERSHIP: ENGINE
 * Orchestrates LifecycleCoordinator.initializeApplication via WorkflowEngine.
 */

import type { LifecycleCoordinator } from "../orchestration/LifecycleCoordinator";
import type { WorkflowDefinition } from "../orchestration/definition";
import type { WorkflowExecutionContext } from "../orchestration/context";

export const FLOW_ID = "initializeApplication" as const;

export const APP_INITIALIZE_COMMAND_ID = "app.initialize" as const;

/** Build a WorkflowDefinition bound to a LifecycleCoordinator instance. */
export function createInitializeApplicationFlow(
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
        message: "initializeApplication",
      });
      await lifecycleCoordinator.initializeApplication(ctx.payload);
      ctx.result = {
        phase: lifecycleCoordinator.getPhase(),
      };
    },
  };
}
