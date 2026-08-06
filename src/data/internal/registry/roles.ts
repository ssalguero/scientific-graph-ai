/**
 * DATA Domain — Registry roles (DATA-P6).
 *
 * DATA-I2: Role vocabulary only. Shadow registries are forbidden regardless of label.
 *
 * @packageDocumentation
 */

export const DataRegistryRole = {
  Authoritative: "Authoritative",
  Supporting: "Supporting",
  Derived: "Derived",
  TransientView: "TransientView",
} as const;

export type DataRegistryRole =
  (typeof DataRegistryRole)[keyof typeof DataRegistryRole];

/** Entity classes that may hold Authoritative Registry identity (DATA-P6 SSOT). */
export const DataEntityClass = {
  Dataset: "dataset",
  ScientificModelEntity: "scientific-model-entity",
} as const;

export type DataEntityClass =
  (typeof DataEntityClass)[keyof typeof DataEntityClass];

/** Permanent P2 components that participate in the P6 ownership map. */
export const DataOwnerComponent = {
  DatasetManager: "DatasetManager",
  ScientificModelManager: "ScientificModelManager",
  MetadataManager: "MetadataManager",
  ValidationEngine: "ValidationEngine",
  TransformationEngine: "TransformationEngine",
  RepositoryServices: "RepositoryServices",
} as const;

export type DataOwnerComponent =
  (typeof DataOwnerComponent)[keyof typeof DataOwnerComponent];
