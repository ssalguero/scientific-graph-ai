/**
 * ENGINE Domain — Register Session Product Flows + business commands.
 * OWNERSHIP: ENGINE composition helper (flows layer).
 */

import type { SessionCoordinator } from "../coordination/session/SessionCoordinator";
import type { CommandOrchestrator } from "../orchestration/interfaces";
import type { WorkflowEngine } from "../orchestration/interfaces";
import {
  createRestoreSessionFlow,
  FLOW_ID as RESTORE_SESSION_FLOW_ID,
  SESSION_RESTORE_COMMAND_ID,
} from "./restore-session";
import {
  createSessionAutosaveFlushFlow,
  FLOW_ID as SESSION_AUTOSAVE_FLUSH_FLOW_ID,
  SESSION_AUTOSAVE_FLUSH_COMMAND_ID,
} from "./session-autosave-flush";

export type RegisterSessionProductFlowsOptions = {
  readonly workflowEngine: WorkflowEngine;
  readonly commandOrchestrator: CommandOrchestrator;
  readonly sessionCoordinator: SessionCoordinator;
};

/**
 * Register Restore Session + Autosave Flush flows and matching business commands.
 */
export function registerSessionProductFlows(
  options: RegisterSessionProductFlowsOptions,
): void {
  const { workflowEngine, commandOrchestrator, sessionCoordinator } = options;

  workflowEngine.register(createRestoreSessionFlow(sessionCoordinator));
  workflowEngine.register(createSessionAutosaveFlushFlow(sessionCoordinator));

  commandOrchestrator.registerHandler({
    id: SESSION_RESTORE_COMMAND_ID,
    workflowId: RESTORE_SESSION_FLOW_ID,
  });
  commandOrchestrator.registerHandler({
    id: SESSION_AUTOSAVE_FLUSH_COMMAND_ID,
    workflowId: SESSION_AUTOSAVE_FLUSH_FLOW_ID,
  });
}

export {
  SESSION_AUTOSAVE_FLUSH_COMMAND_ID,
  SESSION_RESTORE_COMMAND_ID,
};
