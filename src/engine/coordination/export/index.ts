/**
 * ENGINE Domain — Export Results coordination adapter barrel.
 * OWNERSHIP: ENGINE orchestrates Export Results (`exportProject`);
 * `@/lib/project` export use-cases remain authoritative for .sgproj payloads.
 * Only this folder (and coordination/project) may import `@/lib/project`.
 * Never import `@/app/chartExport` — DOM capture deferred to ENG-8/9.
 */

export const EXPORT_COORDINATION_OWNERSHIP =
  "ENGINE orchestrates Export Results; project export use-cases remain authoritative. Chart DOM capture deferred.";

export type {
  DeferredExportCapability,
  ExportExecutionContext,
  ExportProjectByIdInput,
  ExportProjectInput,
  ExportProjectPayloadInput,
  ExportProjectResult,
} from "./types";

export { DEFERRED_EXPORT_CAPABILITIES } from "./types";

export { EXPORT_ERROR_CODES, ExportFlowError } from "./errors";

export type { ExportPort } from "./ports";

export {
  ExportCoordinator,
  createExportCoordinator,
  type ExportCoordinatorOptions,
} from "./ExportCoordinator";

export {
  createLibProjectExportAdapter,
  type LibProjectExportAdapterOptions,
} from "./lib-project-export-adapter";
