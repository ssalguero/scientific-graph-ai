export {
  collapseProjectV2ForHydrate,
} from "./collapse-v2-for-hydrate";

export {
  assertDomainFileShape,
  buildSgprojEnvelope,
  CURRENT_SGPROJ_SCHEMA_VERSION,
  fromDomainScientificProjectFile,
  isScientificProjectFileV1,
  isScientificProjectFileV2,
  toDomainScientificProjectFile,
} from "./envelope";

export {
  buildScientificProjectFileV2,
  buildScientificProjectFileV2Native,
  snapshotV1ToProjectV2,
} from "./serialize-v2";

export {
  projectDatasetV2ToSessionDataset,
  sessionDatasetToProjectDatasetV2,
  type SessionDatasetToProjectDatasetOptions,
} from "./map-session-dataset";

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
} from "../../domain/dataset-id-policy";
