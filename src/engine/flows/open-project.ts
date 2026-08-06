/**
 * Product Flow — Open Project.
 * OWNERSHIP: ENGINE
 * Orchestrates ProjectEngine.open via WorkflowEngine execution stage.
 */

import { PROJECT_ERROR_CODES, ProjectFlowError } from "../business/project/errors";
import type { ProjectEngine } from "../business/project/ProjectEngine";
import type { OpenProjectInput } from "../business/project/types";
import type { WorkflowDefinition } from "../orchestration/definition";
import type { WorkflowExecutionContext } from "../orchestration/context";

export const FLOW_ID = "openProject" as const;

export const PROJECT_OPEN_COMMAND_ID = "project.open" as const;

function parseOpenPayload(payload: unknown): OpenProjectInput {
  if (payload == null || typeof payload !== "object") {
    throw new ProjectFlowError(
      PROJECT_ERROR_CODES.INVALID_PAYLOAD,
      "openProject requires payload { id: string }",
    );
  }
  const record = payload as Record<string, unknown>;
  if (typeof record.id !== "string") {
    throw new ProjectFlowError(
      PROJECT_ERROR_CODES.INVALID_PAYLOAD,
      "openProject requires payload.id: string",
    );
  }
  return {
    id: record.id,
    touchAccess:
      typeof record.touchAccess === "boolean" ? record.touchAccess : undefined,
  };
}

/** Build a WorkflowDefinition bound to a ProjectEngine instance. */
export function createOpenProjectFlow(
  projectEngine: ProjectEngine,
): WorkflowDefinition {
  return {
    id: FLOW_ID,
    execute: async (ctx: WorkflowExecutionContext) => {
      const input = parseOpenPayload(ctx.payload);
      ctx.diagnostics.record({
        operationId: ctx.operationId,
        workflowId: FLOW_ID,
        state: ctx.state,
        stage: "execution",
        message: `openProject id=${input.id}`,
      });
      const result = await projectEngine.open(input);
      ctx.result = result;
    },
  };
}
