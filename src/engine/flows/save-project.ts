/**
 * Product Flow — Save Project.
 * OWNERSHIP: ENGINE
 * Orchestrates ProjectEngine.save via WorkflowEngine execution stage.
 * ENGINE-5: Optional SessionCoordinator.coordinateSave after durable project save (dual-path).
 */

import { PROJECT_ERROR_CODES, ProjectFlowError } from "../business/project/errors";
import type { ProjectEngine } from "../business/project/ProjectEngine";
import type {
  ProjectCollectContext,
  SaveProjectInput,
} from "../business/project/types";
import type { SessionCoordinator } from "../coordination/session/SessionCoordinator";
import type { WorkflowDefinition } from "../orchestration/definition";
import type { WorkflowExecutionContext } from "../orchestration/context";

export const FLOW_ID = "saveProject" as const;

export const PROJECT_SAVE_COMMAND_ID = "project.save" as const;

function parseSavePayload(payload: unknown): SaveProjectInput {
  if (payload == null || typeof payload !== "object") {
    throw new ProjectFlowError(
      PROJECT_ERROR_CODES.INVALID_PAYLOAD,
      "saveProject requires payload { projectName, ctx }",
    );
  }
  const record = payload as Record<string, unknown>;
  if (typeof record.projectName !== "string") {
    throw new ProjectFlowError(
      PROJECT_ERROR_CODES.INVALID_PAYLOAD,
      "saveProject requires payload.projectName: string",
    );
  }
  if (record.ctx == null || typeof record.ctx !== "object") {
    throw new ProjectFlowError(
      PROJECT_ERROR_CODES.INVALID_PAYLOAD,
      "saveProject requires payload.ctx (collect context)",
    );
  }
  return {
    projectName: record.projectName,
    ctx: record.ctx as ProjectCollectContext,
    appVersion:
      typeof record.appVersion === "string" ? record.appVersion : undefined,
  };
}

export type CreateSaveProjectFlowOptions = {
  readonly sessionCoordinator?: SessionCoordinator;
};

/** Build a WorkflowDefinition bound to a ProjectEngine instance. */
export function createSaveProjectFlow(
  projectEngine: ProjectEngine,
  options: CreateSaveProjectFlowOptions = {},
): WorkflowDefinition {
  const sessionCoordinator = options.sessionCoordinator;
  return {
    id: FLOW_ID,
    execute: async (ctx: WorkflowExecutionContext) => {
      const input = parseSavePayload(ctx.payload);
      ctx.diagnostics.record({
        operationId: ctx.operationId,
        workflowId: FLOW_ID,
        state: ctx.state,
        stage: "execution",
        message: `saveProject name=${input.projectName}`,
      });
      const result = await projectEngine.save(input);

      // Dual-path: LocalProjectAdapter owns durable project bytes; Session may flush autosave.
      if (sessionCoordinator) {
        const sessionCoordination = await sessionCoordinator.coordinateSave(
          {
            projectName: input.projectName,
            projectId: result.id,
            reason: "project.save",
          },
          {
            operationId: ctx.operationId,
            flowId: FLOW_ID,
            reason: "project.save",
          },
        );
        ctx.diagnostics.record({
          operationId: ctx.operationId,
          workflowId: FLOW_ID,
          state: ctx.state,
          stage: "execution",
          message: `session.saveCoordination coordinated=${sessionCoordination.coordinated} flushed=${sessionCoordination.flushedAutosave}`,
        });
        ctx.result = { ...result, sessionCoordination };
      } else {
        ctx.result = result;
      }
    },
  };
}
