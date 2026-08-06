/**
 * DATA Domain — Public contract catalog (DATA-I1 technical binding).
 *
 * Every public entry maps to exactly one Capability Group and one Contract
 * Category (DATA-P9 API Compliance Criteria). No new capabilities.
 *
 * Contract Binding Invariants: conceptual mapping is frozen by the API Freeze;
 * technical naming may evolve, conceptual mapping shall not.
 * Runtime Separation Rule: this catalog is declarative — no runtime behavior.
 *
 * @packageDocumentation
 */

import {
  DataCapabilityGroup,
  type DataCapabilityGroup as DataCapabilityGroupType,
} from "./capability-groups";
import {
  DataContractCategory,
  type DataContractCategory as DataContractCategoryType,
} from "./contract-categories";
import {
  DataOperationFamily,
  type DataOperationFamily as DataOperationFamilyType,
} from "./operation-families";
import { DataSurfaceClass } from "./surface";

/** One row in the frozen public surface catalog. */
export interface DataPublicContractEntry {
  readonly id: string;
  readonly capabilityGroup: DataCapabilityGroupType;
  readonly contractCategory: DataContractCategoryType;
  readonly operationFamily: DataOperationFamilyType;
  readonly surfaceClass: typeof DataSurfaceClass.Public;
}

/**
 * Complete public contract catalog — 1:1 with DATA-I1 Dataset / Model /
 * Transformation / Validation / Metadata / Repository API methods.
 */
export const DATA_PUBLIC_CONTRACT_CATALOG = [
  // Dataset
  {
    id: "createDataset",
    capabilityGroup: DataCapabilityGroup.Dataset,
    contractCategory: DataContractCategory.Lifecycle,
    operationFamily: DataOperationFamily.Create,
    surfaceClass: DataSurfaceClass.Public,
  },
  {
    id: "loadDataset",
    capabilityGroup: DataCapabilityGroup.Dataset,
    contractCategory: DataContractCategory.Discovery,
    operationFamily: DataOperationFamily.Read,
    surfaceClass: DataSurfaceClass.Public,
  },
  {
    id: "updateDataset",
    capabilityGroup: DataCapabilityGroup.Dataset,
    contractCategory: DataContractCategory.Lifecycle,
    operationFamily: DataOperationFamily.Update,
    surfaceClass: DataSurfaceClass.Public,
  },
  {
    id: "validateDataset",
    capabilityGroup: DataCapabilityGroup.Dataset,
    contractCategory: DataContractCategory.Validation,
    operationFamily: DataOperationFamily.Validate,
    surfaceClass: DataSurfaceClass.Public,
  },
  {
    id: "removeDataset",
    capabilityGroup: DataCapabilityGroup.Dataset,
    contractCategory: DataContractCategory.Lifecycle,
    operationFamily: DataOperationFamily.Remove,
    surfaceClass: DataSurfaceClass.Public,
  },
  // Scientific Model
  {
    id: "createScientificModel",
    capabilityGroup: DataCapabilityGroup.ScientificModel,
    contractCategory: DataContractCategory.Lifecycle,
    operationFamily: DataOperationFamily.Create,
    surfaceClass: DataSurfaceClass.Public,
  },
  {
    id: "readScientificModel",
    capabilityGroup: DataCapabilityGroup.ScientificModel,
    contractCategory: DataContractCategory.Discovery,
    operationFamily: DataOperationFamily.Read,
    surfaceClass: DataSurfaceClass.Public,
  },
  {
    id: "updateScientificModel",
    capabilityGroup: DataCapabilityGroup.ScientificModel,
    contractCategory: DataContractCategory.Lifecycle,
    operationFamily: DataOperationFamily.Update,
    surfaceClass: DataSurfaceClass.Public,
  },
  {
    id: "removeScientificModel",
    capabilityGroup: DataCapabilityGroup.ScientificModel,
    contractCategory: DataContractCategory.Lifecycle,
    operationFamily: DataOperationFamily.Remove,
    surfaceClass: DataSurfaceClass.Public,
  },
  {
    id: "validateScientificModel",
    capabilityGroup: DataCapabilityGroup.ScientificModel,
    contractCategory: DataContractCategory.Validation,
    operationFamily: DataOperationFamily.Validate,
    surfaceClass: DataSurfaceClass.Public,
  },
  // Transformation
  {
    id: "normalize",
    capabilityGroup: DataCapabilityGroup.Transformation,
    contractCategory: DataContractCategory.Transformation,
    operationFamily: DataOperationFamily.Transform,
    surfaceClass: DataSurfaceClass.Public,
  },
  {
    id: "filter",
    capabilityGroup: DataCapabilityGroup.Transformation,
    contractCategory: DataContractCategory.Transformation,
    operationFamily: DataOperationFamily.Transform,
    surfaceClass: DataSurfaceClass.Public,
  },
  {
    id: "aggregate",
    capabilityGroup: DataCapabilityGroup.Transformation,
    contractCategory: DataContractCategory.Transformation,
    operationFamily: DataOperationFamily.Transform,
    surfaceClass: DataSurfaceClass.Public,
  },
  {
    id: "interpolate",
    capabilityGroup: DataCapabilityGroup.Transformation,
    contractCategory: DataContractCategory.Transformation,
    operationFamily: DataOperationFamily.Transform,
    surfaceClass: DataSurfaceClass.Public,
  },
  {
    id: "transform",
    capabilityGroup: DataCapabilityGroup.Transformation,
    contractCategory: DataContractCategory.Transformation,
    operationFamily: DataOperationFamily.Transform,
    surfaceClass: DataSurfaceClass.Public,
  },
  // Validation
  {
    id: "validate",
    capabilityGroup: DataCapabilityGroup.Validation,
    contractCategory: DataContractCategory.Validation,
    operationFamily: DataOperationFamily.Validate,
    surfaceClass: DataSurfaceClass.Public,
  },
  // Metadata
  {
    id: "readMetadata",
    capabilityGroup: DataCapabilityGroup.Metadata,
    contractCategory: DataContractCategory.Metadata,
    operationFamily: DataOperationFamily.Read,
    surfaceClass: DataSurfaceClass.Public,
  },
  {
    id: "updateMetadata",
    capabilityGroup: DataCapabilityGroup.Metadata,
    contractCategory: DataContractCategory.Metadata,
    operationFamily: DataOperationFamily.Update,
    surfaceClass: DataSurfaceClass.Public,
  },
  {
    id: "validateMetadata",
    capabilityGroup: DataCapabilityGroup.Metadata,
    contractCategory: DataContractCategory.Metadata,
    operationFamily: DataOperationFamily.Validate,
    surfaceClass: DataSurfaceClass.Public,
  },
  {
    id: "trackLineage",
    capabilityGroup: DataCapabilityGroup.Metadata,
    contractCategory: DataContractCategory.Metadata,
    operationFamily: DataOperationFamily.TrackLineageMetadata,
    surfaceClass: DataSurfaceClass.Public,
  },
  // Repository
  {
    id: "discoverAssets",
    capabilityGroup: DataCapabilityGroup.Repository,
    contractCategory: DataContractCategory.Discovery,
    operationFamily: DataOperationFamily.QueryDiscover,
    surfaceClass: DataSurfaceClass.Public,
  },
  {
    id: "retrieveAsset",
    capabilityGroup: DataCapabilityGroup.Repository,
    contractCategory: DataContractCategory.Discovery,
    operationFamily: DataOperationFamily.Read,
    surfaceClass: DataSurfaceClass.Public,
  },
  {
    id: "publishAsset",
    capabilityGroup: DataCapabilityGroup.Repository,
    contractCategory: DataContractCategory.Publication,
    operationFamily: DataOperationFamily.PublishMakeAvailable,
    surfaceClass: DataSurfaceClass.Public,
  },
] as const satisfies readonly DataPublicContractEntry[];

export type DataPublicContractId =
  (typeof DATA_PUBLIC_CONTRACT_CATALOG)[number]["id"];
