export {
  DOMAIN_SCHEMA_VERSION_V1,
  type ComparisonSlotIdV1,
  type ComparisonSlotV1,
  type DatasetAnalysisProfileInferentialSnapshotV1,
  type DatasetAnalysisProfileNormalitySnapshotV1,
  type DatasetAnalysisProfileV1,
  type DomainSchemaVersionV1,
  type ProjectAnalysisConfigV1,
  type ProjectAnalysisModesV1,
  type ProjectAnalysisSelectionsV1,
  type ProjectComparisonV1,
  type ProjectDatasetV1,
  type ProjectGraphContextV1,
  type ProjectImportProvenanceV1,
  type ProjectImportedDatasetInfoV1,
  type ProjectMetadataV1,
  type ProjectWorkflowV1,
  type ProjectWorkspaceV1,
  type ScientificProjectV1,
} from "./types-v1";

export {
  DOMAIN_SCHEMA_VERSION_V2,
  type ComparisonSlotV2,
  type DatasetAnalysisProfileCaptureMetadataV2,
  type DatasetAnalysisProfileMethodologicalSnapshotV2,
  type DatasetAnalysisProfileMultivariateSnapshotV2,
  type DatasetAnalysisProfilePublicationSnapshotV2,
  type DatasetAnalysisProfileV2,
  type DomainSchemaVersionV2,
  type ProjectAnalysisConfigV2,
  type ProjectComparisonV2,
  type ProjectDatasetV2,
  type ProjectMetadataV2,
  type ProjectVisualGraphPersistedV2,
  type ProjectWorksheetV2,
  type ScientificProjectV2,
} from "./types-v2";

export {
  getDomainSchemaVersion,
  isDomainProjectFileV1,
  isDomainProjectFileV2,
  isScientificProjectV1,
  isScientificProjectV2,
  type DomainSchemaVersion,
  type DomainScientificProjectFile,
  type ScientificProject,
} from "./scientific-project";

export {
  migrateDomainProjectFileToV2,
  migrateProjectToV2,
  migrateV1ToV2,
  type DomainMigrationWarning,
  type MigrateDomainFileToV2Result,
  type MigrateV1ToV2Result,
} from "./migrations";

export {
  domainIssue,
  isBoolean,
  isNumber,
  isRecord,
  isString,
  isStringArray,
  pushDomainIssue,
  type DomainValidationIssue,
  type DomainValidationResult,
} from "./guards";

export {
  validateDomainProjectFileV2,
  validateScientificProjectV2,
} from "./validate-v2";

export {
  assertPersistedDomainDatasetId,
  assertStableDatasetId,
  assertUniquePersistedDatasetIds,
  createPersistedDatasetUuid,
  DatasetIdPolicyError,
  enforcePersistedDatasetIdentity,
  isPersistedDomainDatasetId,
  isPrimaryMigratedDatasetId,
  isSessionRuntimeDatasetId,
  isUuidDatasetId,
  parseSequencedDatasetId,
  preservePersistedDatasetId,
  PERSISTED_DATASET_ID_SEPARATOR,
  PRIMARY_DATASET_ID_SUFFIX,
  SESSION_RUNTIME_DATASET_ID_PREFIX,
  toPrimaryDatasetId,
  toSequencedDatasetId,
} from "./dataset-id-policy";

export {
  cloneExperimentalSeries,
  computeDatasetMetrics,
} from "./dataset-series-utils";
