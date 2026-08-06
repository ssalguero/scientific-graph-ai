/**
 * ENGINE Domain — Coordination layer barrel (ENGINE-internal only).
 * Adapters to Platform + DATA — not ownership of those domains.
 * External consumers must NOT import this path — use `@/engine` only.
 * ENGINE-4: Project local-project adapter under coordination/project.
 * ENGINE-5: Session coordination adapters under coordination/session.
 * ENGINE-6: Import / Export adapters under coordination/import|export.
 * ENGINE-7: Runtime / Workspace / Windows injectable ports (no-op defaults).
 */

export { DATA_COORDINATION_OWNERSHIP } from "./data";
export {
  SESSION_COORDINATION_OWNERSHIP,
  SessionCoordinator,
  createSessionCoordinator,
  createNoOpSessionPorts,
  createPlatformRestoreSessionPort,
  createPlatformAutosavePort,
} from "./session";
export {
  WORKSPACE_COORDINATION_OWNERSHIP,
  createNoOpWorkspacePort,
  createInjectableWorkspacePort,
} from "./workspace";
export {
  WINDOWS_COORDINATION_OWNERSHIP,
  createNoOpWindowsPort,
  createInjectableWindowsPort,
} from "./windows";
export {
  RUNTIME_COORDINATION_OWNERSHIP,
  createNoOpRuntimePort,
  createInjectableRuntimePort,
} from "./runtime";
export {
  PROJECT_COORDINATION_OWNERSHIP,
  buildEmptyProjectCollectContext,
  createLocalProjectAdapter,
  ENGINE_DEFAULT_PROJECT_NAME,
  LocalProjectAdapter,
} from "./project";
export {
  IMPORT_COORDINATION_OWNERSHIP,
  ImportCoordinator,
  createImportCoordinator,
  createLibImportAdapter,
} from "./import";
export {
  EXPORT_COORDINATION_OWNERSHIP,
  ExportCoordinator,
  createExportCoordinator,
  createLibProjectExportAdapter,
  DEFERRED_EXPORT_CAPABILITIES,
} from "./export";
