/**
 * DATA Domain — Public contracts barrel (`@/data/contracts`).
 *
 * DATA-I1: Official type-level Scientific Data API surface.
 * Consumers may import contract types from here. Never import DATA internals.
 *
 * @packageDocumentation
 */

export {
  DataCapabilityGroup,
  DATA_CAPABILITY_GROUPS,
  type DataCapabilityGroup as DataCapabilityGroupId,
} from "./capability-groups";

export {
  DataContractCategory,
  DATA_CONTRACT_CATEGORIES,
  type DataContractCategory as DataContractCategoryId,
} from "./contract-categories";

export {
  DataOperationFamily,
  DATA_OPERATION_FAMILIES,
  type DataOperationFamily as DataOperationFamilyId,
} from "./operation-families";

export type { DataRequest, DataFailure, DataResult } from "./results";

export {
  DataSurfaceClass,
  DATA_NEVER_PUBLIC,
  type DataSurfaceClass as DataSurfaceClassId,
} from "./surface";

export {
  DATA_CONSUMER_MAY_ASSUME,
  DATA_CONSUMER_MUST_NEVER_ASSUME,
  type DataConsumerMayAssume,
  type DataConsumerMustNeverAssume,
} from "./consumer-guarantees";

export {
  DATA_CONTRACT_INVARIANTS,
  type DataContractInvariant,
} from "./invariants";

export type { DatasetApi } from "./dataset";
export type { ScientificModelApi } from "./scientific-model";
export type { TransformationApi } from "./transformation";
export type { ValidationApi } from "./validation";
export type { MetadataApi } from "./metadata";
export type { RepositoryApi } from "./repository";

export {
  DATA_PUBLIC_CONTRACT_CATALOG,
  type DataPublicContractEntry,
  type DataPublicContractId,
} from "./catalog";
