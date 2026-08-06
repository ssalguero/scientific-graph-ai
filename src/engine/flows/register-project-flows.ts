/**
 * ENGINE Domain — Register Project Product Flows + business commands.
 * OWNERSHIP: ENGINE composition helper (flows layer).
 */

import type { ProjectEngine } from "../business/project/ProjectEngine";
import type { SessionCoordinator } from "../coordination/session/SessionCoordinator";
import type { CommandOrchestrator } from "../orchestration/interfaces";
import type { WorkflowEngine } from "../orchestration/interfaces";
import {
  createCloseProjectFlow,
  FLOW_ID as CLOSE_PROJECT_FLOW_ID,
  PROJECT_CLOSE_COMMAND_ID,
} from "./close-project";
import {
  createCreateProjectFlow,
  FLOW_ID as CREATE_PROJECT_FLOW_ID,
  PROJECT_CREATE_COMMAND_ID,
} from "./create-project";
import {
  createOpenProjectFlow,
  FLOW_ID as OPEN_PROJECT_FLOW_ID,
  PROJECT_OPEN_COMMAND_ID,
} from "./open-project";
import {
  createSaveProjectFlow,
  FLOW_ID as SAVE_PROJECT_FLOW_ID,
  PROJECT_SAVE_COMMAND_ID,
} from "./save-project";

export type RegisterProjectProductFlowsOptions = {
  readonly workflowEngine: WorkflowEngine;
  readonly commandOrchestrator: CommandOrchestrator;
  readonly projectEngine: ProjectEngine;
  /** ENGINE-5: optional Session save coordination after durable project save. */
  readonly sessionCoordinator?: SessionCoordinator;
};

/**
 * Register Create / Open / Save / Close Product Flows and matching business commands.
 */
export function registerProjectProductFlows(
  options: RegisterProjectProductFlowsOptions,
): void {
  const {
    workflowEngine,
    commandOrchestrator,
    projectEngine,
    sessionCoordinator,
  } = options;

  workflowEngine.register(createCreateProjectFlow(projectEngine));
  workflowEngine.register(createOpenProjectFlow(projectEngine));
  workflowEngine.register(
    createSaveProjectFlow(projectEngine, { sessionCoordinator }),
  );
  workflowEngine.register(createCloseProjectFlow(projectEngine));

  commandOrchestrator.registerHandler({
    id: PROJECT_CREATE_COMMAND_ID,
    workflowId: CREATE_PROJECT_FLOW_ID,
  });
  commandOrchestrator.registerHandler({
    id: PROJECT_OPEN_COMMAND_ID,
    workflowId: OPEN_PROJECT_FLOW_ID,
  });
  commandOrchestrator.registerHandler({
    id: PROJECT_SAVE_COMMAND_ID,
    workflowId: SAVE_PROJECT_FLOW_ID,
  });
  commandOrchestrator.registerHandler({
    id: PROJECT_CLOSE_COMMAND_ID,
    workflowId: CLOSE_PROJECT_FLOW_ID,
  });
}

export {
  PROJECT_CLOSE_COMMAND_ID,
  PROJECT_CREATE_COMMAND_ID,
  PROJECT_OPEN_COMMAND_ID,
  PROJECT_SAVE_COMMAND_ID,
};
