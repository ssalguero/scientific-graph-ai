/**
 * Product Flow — Close Project.
 * OWNERSHIP: ENGINE
 * Orchestrates ProjectEngine.close via WorkflowEngine execution stage.
 */

import type { ProjectEngine } from "../business/project/ProjectEngine";
import type { CloseProjectInput } from "../business/project/types";
import type { WorkflowDefinition } from "../orchestration/definition";
import type { WorkflowExecutionContext } from "../orchestration/context";

export const FLOW_ID = "closeProject" as const;

export const PROJECT_CLOSE_COMMAND_ID = "project.close" as const;

function parseClosePayload(payload: unknown): CloseProjectInput {
  if (payload == null) return {};
  if (typeof payload !== "object") return {};
  const record = payload as Record<string, unknown>;
  return {
    id: typeof record.id === "string" ? record.id : undefined,
    discardUnsaved:
      typeof record.discardUnsaved === "boolean"
        ? record.discardUnsaved
        : undefined,
  };
}

/** Build a WorkflowDefinition bound to a ProjectEngine instance. */
export function createCloseProjectFlow(
  projectEngine: ProjectEngine,
): WorkflowDefinition {
  return {
    id: FLOW_ID,
    execute: async (ctx: WorkflowExecutionContext) => {
      const input = parseClosePayload(ctx.payload);
      ctx.diagnostics.record({
        operationId: ctx.operationId,
        workflowId: FLOW_ID,
        state: ctx.state,
        stage: "execution",
        message: `closeProject id=${input.id ?? "(active)"}`,
      });
      const result = await projectEngine.close(input);
      ctx.result = result;
    },
  };
}
