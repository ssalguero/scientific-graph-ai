/**
 * Product Flow — Activate Workspace.
 * OWNERSHIP: ENGINE
 * Orchestrates LifecycleCoordinator.activateWorkspace via WorkflowEngine.
 */

import type { LifecycleCoordinator } from "../orchestration/LifecycleCoordinator";
import type { WorkflowDefinition } from "../orchestration/definition";
import type { WorkflowExecutionContext } from "../orchestration/context";

export const FLOW_ID = "activateWorkspace" as const;

export const WORKSPACE_ACTIVATE_COMMAND_ID = "workspace.activate" as const;

/** Build a WorkflowDefinition bound to a LifecycleCoordinator instance. */
export function createActivateWorkspaceFlow(
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
        message: "activateWorkspace",
      });
      await lifecycleCoordinator.activateWorkspace(ctx.payload);
      ctx.result = {
        phase: lifecycleCoordinator.getPhase(),
        workspaceId: lifecycleCoordinator.getActiveWorkspaceId(),
      };
    },
  };
}
