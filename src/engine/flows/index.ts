/**
 * ENGINE Domain — Product Flow definitions.
 * OWNERSHIP: ENGINE owns Product Flow definitions (AD-004).
 * ENGINE-4: Create / Open / Save / Close Project flows are executable.
 * ENGINE-5: Restore Session + Session Autosave Flush are executable (internal workflow ids).
 * ENGINE-6: Import Dataset + Export Results (exportProject) are executable.
 * ENGINE-7: Initialize / Activate Workspace / Activate Document / Shutdown are executable
 * (internal workflow ids matching frozen LifecycleApi names — not public WorkflowApi).
 */

export {
  createCreateProjectFlow,
  FLOW_ID as CREATE_PROJECT_FLOW_ID,
  PROJECT_CREATE_COMMAND_ID,
} from "./create-project";
export {
  createOpenProjectFlow,
  FLOW_ID as OPEN_PROJECT_FLOW_ID,
  PROJECT_OPEN_COMMAND_ID,
} from "./open-project";
export {
  createCloseProjectFlow,
  FLOW_ID as CLOSE_PROJECT_FLOW_ID,
  PROJECT_CLOSE_COMMAND_ID,
} from "./close-project";
export {
  createSaveProjectFlow,
  FLOW_ID as SAVE_PROJECT_FLOW_ID,
  PROJECT_SAVE_COMMAND_ID,
  type CreateSaveProjectFlowOptions,
} from "./save-project";
export {
  createImportDatasetFlow,
  DATASET_IMPORT_COMMAND_ID,
  FLOW_ID as IMPORT_DATASET_FLOW_ID,
} from "./import-dataset";
export {
  createRestoreSessionFlow,
  FLOW_ID as RESTORE_SESSION_FLOW_ID,
  SESSION_RESTORE_COMMAND_ID,
} from "./restore-session";
export {
  createSessionAutosaveFlushFlow,
  FLOW_ID as SESSION_AUTOSAVE_FLUSH_FLOW_ID,
  SESSION_AUTOSAVE_FLUSH_COMMAND_ID,
} from "./session-autosave-flush";
export {
  createExportProjectFlow,
  createExportResultsAliasFlow,
  EXPORT_RESULTS_ALIAS_ID,
  EXPORT_RESULTS_ALIAS_ID as EXPORT_RESULTS_FLOW_ID,
  FLOW_ID as EXPORT_PROJECT_FLOW_ID,
  PRODUCT_FLOW_NAME as EXPORT_RESULTS_PRODUCT_FLOW_NAME,
  PROJECT_EXPORT_COMMAND_ID,
} from "./export-results";
export {
  APP_INITIALIZE_COMMAND_ID,
  createInitializeApplicationFlow,
  FLOW_ID as INITIALIZE_APPLICATION_FLOW_ID,
} from "./initialize-application";
export {
  createActivateWorkspaceFlow,
  FLOW_ID as ACTIVATE_WORKSPACE_FLOW_ID,
  WORKSPACE_ACTIVATE_COMMAND_ID,
} from "./activate-workspace";
export {
  createActivateDocumentFlow,
  DOCUMENT_ACTIVATE_COMMAND_ID,
  FLOW_ID as ACTIVATE_DOCUMENT_FLOW_ID,
} from "./activate-document";
export {
  APP_SHUTDOWN_COMMAND_ID,
  createShutdownApplicationFlow,
  FLOW_ID as SHUTDOWN_APPLICATION_FLOW_ID,
} from "./shutdown-application";
export {
  registerProjectProductFlows,
  type RegisterProjectProductFlowsOptions,
} from "./register-project-flows";
export {
  registerSessionProductFlows,
  type RegisterSessionProductFlowsOptions,
} from "./register-session-flows";
export {
  registerImportExportProductFlows,
  type RegisterImportExportProductFlowsOptions,
} from "./register-import-export-flows";
export {
  registerLifecycleProductFlows,
  type RegisterLifecycleProductFlowsOptions,
} from "./register-lifecycle-flows";

export const FLOWS_OWNERSHIP =
  "ENGINE owns Product Flow definitions; UX initiates intentions only.";
