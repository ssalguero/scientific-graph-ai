/**
 * ENGINE Domain — Import Dataset coordination adapter barrel.
 * OWNERSHIP: ENGINE orchestrates Import Dataset; `@/lib/import` owns import science.
 * Only this folder may import `@/lib/import` (boundary allowlist).
 */

export const IMPORT_COORDINATION_OWNERSHIP =
  "ENGINE orchestrates Import Dataset; @/lib/import remains authoritative.";

export type {
  FinalizeWizardImportInput,
  ImportDatasetInput,
  ImportDatasetResult,
  ImportExecutionContext,
  ImportFileHandle,
} from "./types";

export { IMPORT_ERROR_CODES, ImportFlowError } from "./errors";

export type { ImportPort } from "./ports";

export {
  ImportCoordinator,
  createImportCoordinator,
  type ImportCoordinatorOptions,
} from "./ImportCoordinator";

export { createLibImportAdapter } from "./lib-import-adapter";
