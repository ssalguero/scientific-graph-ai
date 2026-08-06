/**
 * DATA Domain — Public Scientific Data API barrel.
 *
 * OWNERSHIP: DATA is the authoritative scientific knowledge domain.
 * Consumers (ENGINE, AI, and other approved peers) may import ONLY from `@/data`
 * (and optionally `@/data/contracts`). Do not import model/, metadata/,
 * processing/, validation/, repository/ (component paths), integration/,
 * or internal/ from outside DATA.
 *
 * DATA-I0: Package foundation.
 * DATA-I1: Public contract surface bound (types + catalog).
 * DATA-I7: Runtime facades via configureData / getDataApi (frozen capabilities only).
 * DATA-I8: Boundary enforcement is via scripts/validate-data-boundaries (not runtime).
 *
 * Hard constraints (DATA-P1 / Non Goals): never render UI; never own Product
 * Flows; never own persistence engines; never redefine frozen architecture.
 *
 * @packageDocumentation
 */

// --- Public contract types & frozen catalogs ---
export type {
  DataCapabilityGroupId,
  DataContractCategoryId,
  DataOperationFamilyId,
  DataSurfaceClassId,
  DataConsumerMayAssume,
  DataConsumerMustNeverAssume,
  DataContractInvariant,
  DataRequest,
  DataFailure,
  DataResult,
  DatasetApi,
  ScientificModelApi,
  TransformationApi,
  ValidationApi,
  MetadataApi,
  RepositoryApi,
  DataPublicContractEntry,
  DataPublicContractId,
} from "./contracts";

export {
  DataCapabilityGroup,
  DATA_CAPABILITY_GROUPS,
  DataContractCategory,
  DATA_CONTRACT_CATEGORIES,
  DataOperationFamily,
  DATA_OPERATION_FAMILIES,
  DataSurfaceClass,
  DATA_NEVER_PUBLIC,
  DATA_CONSUMER_MAY_ASSUME,
  DATA_CONSUMER_MUST_NEVER_ASSUME,
  DATA_CONTRACT_INVARIANTS,
  DATA_PUBLIC_CONTRACT_CATALOG,
} from "./contracts";

// --- Public surface aggregate + runtime bootstrap (DATA-I7) ---
export type { DataPublicApi } from "./public";
export { configureData, getDataApi } from "./public";
