/**
 * Product Flow — Create Project.
 * OWNERSHIP: ENGINE
 * Orchestrates ProjectEngine.create via WorkflowEngine execution stage.
 */

import type { ProjectEngine } from "../business/project/ProjectEngine";
import type { CreateProjectInput } from "../business/project/types";
import type { WorkflowDefinition } from "../orchestration/definition";
import type { WorkflowExecutionContext } from "../orchestration/context";

export const FLOW_ID = "createProject" as const;

export const PROJECT_CREATE_COMMAND_ID = "project.create" as const;

function parseCreatePayload(payload: unknown): CreateProjectInput {
  if (payload == null) return {};
  if (typeof payload !== "object") return {};
  return payload as CreateProjectInput;
}

/** Build a WorkflowDefinition bound to a ProjectEngine instance. */
export function createCreateProjectFlow(
  projectEngine: ProjectEngine,
): WorkflowDefinition {
  return {
    id: FLOW_ID,
    execute: async (ctx: WorkflowExecutionContext) => {
      const input = parseCreatePayload(ctx.payload);
      ctx.diagnostics.record({
        operationId: ctx.operationId,
        workflowId: FLOW_ID,
        state: ctx.state,
        stage: "execution",
        message: `createProject name=${input.name ?? "(default)"}`,
      });
      const result = await projectEngine.create(input);
      ctx.result = result;
    },
  };
}
