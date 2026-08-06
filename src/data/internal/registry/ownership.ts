/**
 * DATA Domain — Ownership Strategy binding (DATA-P6 §4).
 *
 * Documentary + enforceable map. Does not reinterpret P6.
 *
 * @packageDocumentation
 */

import {
  DataEntityClass,
  DataOwnerComponent,
  type DataEntityClass as DataEntityClassId,
  type DataOwnerComponent as DataOwnerComponentId,
} from "./roles";

export interface OwnershipRecord {
  readonly owner: DataOwnerComponentId;
  readonly owns: string;
  readonly references: readonly string[];
  readonly neverOwns: readonly string[];
}

/** Frozen ownership map — permanent components (DATA-P6). */
export const DATA_OWNERSHIP_STRATEGY = {
  [DataOwnerComponent.DatasetManager]: {
    owner: DataOwnerComponent.DatasetManager,
    owns: "Authoritative Registry of datasets",
    references: [
      "Scientific Model entities",
      "Metadata associations",
      "Validation outcomes",
      "Repository access paths",
    ],
    neverOwns: [
      "Persistence engines",
      "Product Flows",
      "UI",
      "Scientific model definition authority",
      "Transformation algorithms as ownership",
    ],
  },
  [DataOwnerComponent.ScientificModelManager]: {
    owner: DataOwnerComponent.ScientificModelManager,
    owns: "Authoritative Registry of scientific model entities",
    references: ["Metadata associations", "Dataset links"],
    neverOwns: [
      "Dataset identity authority",
      "Persistence",
      "UI",
      "Product Flows",
      "Validation policy ownership",
    ],
  },
  [DataOwnerComponent.MetadataManager]: {
    owner: DataOwnerComponent.MetadataManager,
    owns: "Supporting Registry of metadata and lineage associations",
    references: ["Dataset and Model authoritative identities"],
    neverOwns: [
      "Independent entity identity",
      "Persistence engines",
      "UI",
      "Product Flows",
    ],
  },
  [DataOwnerComponent.ValidationEngine]: {
    owner: DataOwnerComponent.ValidationEngine,
    owns: "Validation outcomes for a meaning snapshot",
    references: ["Dataset/Model/Metadata meaning under evaluation"],
    neverOwns: [
      "Entity identity registries",
      "Persistence",
      "Product Flows",
      "UI",
    ],
  },
  [DataOwnerComponent.TransformationEngine]: {
    owner: DataOwnerComponent.TransformationEngine,
    owns: "Transformation specifications/results as processing meaning",
    references: [
      "Input entities from Authoritative Registries",
      "Metadata/lineage expectations",
    ],
    neverOwns: [
      "Dataset/Model identity SSOT",
      "Persistence",
      "Product Flows",
      "UI",
    ],
  },
  [DataOwnerComponent.RepositoryServices]: {
    owner: DataOwnerComponent.RepositoryServices,
    owns: "Availability/access semantics (Publication/Discovery mediation)",
    references: [
      "Authoritative Registries",
      "Validation outcomes",
      "Published lifecycle state",
    ],
    neverOwns: [
      "Creating identity outside managers",
      "Persistence engines",
      "UI",
      "Product Flows",
    ],
  },
} as const satisfies Record<DataOwnerComponentId, OwnershipRecord>;

/** Exactly one Authoritative Registry owner per entity class (DATA-P6 SSOT). */
export const DATA_AUTHORITATIVE_OWNER_BY_CLASS = {
  [DataEntityClass.Dataset]: DataOwnerComponent.DatasetManager,
  [DataEntityClass.ScientificModelEntity]:
    DataOwnerComponent.ScientificModelManager,
} as const satisfies Record<DataEntityClassId, DataOwnerComponentId>;

export function authoritativeOwnerFor(
  entityClass: DataEntityClassId,
): DataOwnerComponentId {
  return DATA_AUTHORITATIVE_OWNER_BY_CLASS[entityClass];
}
