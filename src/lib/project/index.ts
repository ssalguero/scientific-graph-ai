export {
  CURRENT_SCHEMA_VERSION,
  DEFAULT_PROJECT_NAME,
  PROJECT_FILE_EXTENSION,
  PROJECT_KIND,
  PROJECT_SIZE_WARN_BYTES,
  SCHEMA_VERSION_V1,
  SCHEMA_VERSION_V2,
  WORKSPACE_SECTIONS,
  INSPECTOR_SECTIONS,
  CONTROL_PANEL_TABS,
} from "./constants";

export {
  VISIBILITY_KEYS_V1,
  MODULE_KEYS_V1,
  GUIDED_WORKFLOW_TOGGLE_KEYS_V1,
  ANALYSIS_MODE_KEYS_V1,
  SELECTION_KEYS_V1,
} from "./keys";

export type {
  ComparisonSlotIdV1,
  ComparisonSlotV1,
  DatasetAnalysisProfileV1,
  GraphEditorProjectSnapshot,
  MigrateProjectFileResult,
  ParseProjectFileResult,
  ProjectAnalysisConfigV1,
  ProjectAnalysisModesV1,
  ProjectAnalysisSelectionsV1,
  ProjectComparisonV1,
  ProjectDataset,
  ProjectGraphContextV1,
  ProjectImportProvenance,
  ProjectImportedDatasetInfo,
  ProjectMetadataV1,
  ProjectValidationIssue,
  ProjectValidationResult,
  ProjectWorkspaceV1,
  ProjectWorkflowV1,
  ScientificProjectFile,
  ScientificProjectFileV1,
  ScientificProjectFileV2,
  ScientificProjectV1,
  ScientificProjectV2,
  SerializeProjectInput,
  SerializeProjectV2Input,
  SerializeProjectOptions,
  SerializeProjectResult,
  PostHydrateAction,
  HydrateProjectPatch,
  HydrateProjectResult,
  HydrateProjectV2Patch,
} from "./types";

export type { VisibilityKeyV1 } from "./keys";

export {
  GUIDED_WORKFLOW_STATUS_VALUES,
  GUIDED_WORKFLOW_TEMPLATE_IDS,
} from "./types";

export { parseProjectFile, parseProjectJson, parseProjectUnknown } from "./parse";

export {
  migrateProjectFile,
  migrateProjectJson,
  MAX_SUPPORTED_SCHEMA_VERSION,
} from "./migrate";

export {
  validateScientificProjectFile,
  validateScientificProjectV1,
  validateScientificProjectV2,
} from "./validate";

export {
  normalizeProjectSnapshot,
  serializeProject,
} from "./serialize";

export { normalizeScientificProjectV2 } from "./normalize-v2";

export { serializeProjectV2 } from "./serialize-project-v2";

export {
  applyHydrateProjectV2Patch,
  buildHydrateProjectV2Patch,
  cloneScientificProjectV2,
} from "./apply-hydrate-project-v2-patch";

export {
  sanitizeComparison,
  sanitizeProjectSnapshot,
  sanitizeSelections,
  sanitizeVisibility,
  sanitizeWorkflowSession,
  sanitizeWorkspace,
} from "./sanitize";

export {
  sanitizeComparisonV2,
  sanitizeScientificProjectV2,
} from "./sanitize-project-v2";

export type { SanitizeScientificProjectV2Result } from "./sanitize-project-v2";

export {
  buildHydrateProjectPatch,
  hydrateProject,
  hydrateProjectJson,
  projectFileToHydrateV1,
} from "./hydrate";

export {
  buildScientificProjectFileV2,
  buildScientificProjectFileV2Native,
  collapseProjectV2ForHydrate,
  isScientificProjectFileV1,
  isScientificProjectFileV2,
  snapshotV1ToProjectV2,
} from "./adapters/sgproj";

export {
  formatProjectOpenError,
  formatProjectSaveError,
  formatProjectValidationIssue,
  formatProjectWarningCount,
  sniffJsonFileKind,
  validateProjectFileSelection,
} from "./userMessages";

export type { ProjectFileFeedbackKind, SniffedJsonFileKind } from "./userMessages";

import { hydrateProjectJson } from "./hydrate";
import { migrateProjectJson } from "./migrate";
import type {
  HydrateProjectResult,
  ProjectValidationResult,
  ScientificProjectFile,
} from "./types";
import { validateScientificProjectFile } from "./validate";

export const loadProjectJson = (
  text: string
): ProjectValidationResult & { file?: ScientificProjectFile } => {
  const migrated = migrateProjectJson(text);
  if (!migrated.ok) {
    return { ok: false, errors: migrated.errors, warnings: [] };
  }

  const validated = validateScientificProjectFile(migrated.file);
  return {
    ...validated,
    warnings: [...migrated.warnings, ...validated.warnings],
    file: migrated.file,
  };
};

export const loadAndHydrateProjectJson = (
  text: string
): HydrateProjectResult => hydrateProjectJson(text);
