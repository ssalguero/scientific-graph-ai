/**
 * ENGINE Domain — Register Lifecycle Product Flows + business commands.
 * OWNERSHIP: ENGINE composition helper (flows layer).
 * Internal workflow ids match frozen LifecycleApi names (not public WorkflowApi).
 */

import type { LifecycleCoordinator } from "../orchestration/LifecycleCoordinator";
import type { CommandOrchestrator } from "../orchestration/interfaces";
import type { WorkflowEngine } from "../orchestration/interfaces";
import {
  createActivateDocumentFlow,
  DOCUMENT_ACTIVATE_COMMAND_ID,
  FLOW_ID as ACTIVATE_DOCUMENT_FLOW_ID,
} from "./activate-document";
import {
  createActivateWorkspaceFlow,
  FLOW_ID as ACTIVATE_WORKSPACE_FLOW_ID,
  WORKSPACE_ACTIVATE_COMMAND_ID,
} from "./activate-workspace";
import {
  APP_INITIALIZE_COMMAND_ID,
  createInitializeApplicationFlow,
  FLOW_ID as INITIALIZE_APPLICATION_FLOW_ID,
} from "./initialize-application";
import {
  APP_SHUTDOWN_COMMAND_ID,
  createShutdownApplicationFlow,
  FLOW_ID as SHUTDOWN_APPLICATION_FLOW_ID,
} from "./shutdown-application";

export type RegisterLifecycleProductFlowsOptions = {
  readonly workflowEngine: WorkflowEngine;
  readonly commandOrchestrator: CommandOrchestrator;
  readonly lifecycleCoordinator: LifecycleCoordinator;
};

/**
 * Register initialize / activate workspace / activate document / shutdown flows
 * and matching business commands.
 */
export function registerLifecycleProductFlows(
  options: RegisterLifecycleProductFlowsOptions,
): void {
  const { workflowEngine, commandOrchestrator, lifecycleCoordinator } =
    options;

  workflowEngine.register(
    createInitializeApplicationFlow(lifecycleCoordinator),
  );
  workflowEngine.register(createActivateWorkspaceFlow(lifecycleCoordinator));
  workflowEngine.register(createActivateDocumentFlow(lifecycleCoordinator));
  workflowEngine.register(createShutdownApplicationFlow(lifecycleCoordinator));

  commandOrchestrator.registerHandler({
    id: APP_INITIALIZE_COMMAND_ID,
    workflowId: INITIALIZE_APPLICATION_FLOW_ID,
  });
  commandOrchestrator.registerHandler({
    id: WORKSPACE_ACTIVATE_COMMAND_ID,
    workflowId: ACTIVATE_WORKSPACE_FLOW_ID,
  });
  commandOrchestrator.registerHandler({
    id: DOCUMENT_ACTIVATE_COMMAND_ID,
    workflowId: ACTIVATE_DOCUMENT_FLOW_ID,
  });
  commandOrchestrator.registerHandler({
    id: APP_SHUTDOWN_COMMAND_ID,
    workflowId: SHUTDOWN_APPLICATION_FLOW_ID,
  });
}

export {
  APP_INITIALIZE_COMMAND_ID,
  APP_SHUTDOWN_COMMAND_ID,
  DOCUMENT_ACTIVATE_COMMAND_ID,
  WORKSPACE_ACTIVATE_COMMAND_ID,
};
