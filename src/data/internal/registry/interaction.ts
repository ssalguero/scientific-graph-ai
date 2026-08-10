/**
 * DATA Domain — Registry Interaction Rules (DATA-P6 §10).
 *
 * Declarative collaboration checks. No lifecycle, validation, or transform
 * behavior — only identity-authority interaction constraints for DATA-I2.
 *
 * @packageDocumentation
 */

import type { DataEntityIdentity } from "./identity";
import { DataEntityClass, DataOwnerComponent } from "./roles";

export const DATA_REGISTRY_INTERACTION_RULES = [
  "Scientific Model Manager establishes model-entity authority that Dataset Manager may reference",
  "Metadata Manager attaches supporting associations only to Dataset/Model authoritative identities",
  "Validation Engine evaluates meaning from Authoritative + Supporting registries; never mints identity",
  "Transformation Engine reads authoritative inputs; Derived meaning registers via Dataset/Model authority with lineage",
  "Repository Services expose Discovery/Publication only for authoritative identities",
  "No component may silently rewrite another component Owned concern",
] as const;

/** Dataset Manager may reference a scientific-model identity (not own it). */
export function assertDatasetMayReferenceModel(
  modelIdentity: DataEntityIdentity,
): void {
  if (modelIdentity.entityClass !== DataEntityClass.ScientificModelEntity) {
    throw new Error(
      "Registry interaction: Dataset Manager may only reference scientific-model-entity identities",
    );
  }
  if (
    modelIdentity.ownerComponent !== DataOwnerComponent.ScientificModelManager
  ) {
    throw new Error(
      "Registry interaction: referenced model identity must be owned by ScientificModelManager",
    );
  }
}

/** Metadata Supporting Registry may only bind to Dataset or Model identities. */
export function assertMetadataMayBind(
  identity: DataEntityIdentity,
): void {
  if (
    identity.entityClass !== DataEntityClass.Dataset &&
    identity.entityClass !== DataEntityClass.ScientificModelEntity
  ) {
    throw new Error(
      "Registry interaction: Metadata Supporting Registry binds only to dataset or scientific-model-entity identities",
    );
  }
}

/** Validation / Transformation / Repository must not mint identity. */
export function assertNonIdentityComponent(
  component: string,
): void {
  const forbidden = new Set<string>([
    DataOwnerComponent.ValidationEngine,
    DataOwnerComponent.TransformationEngine,
    DataOwnerComponent.RepositoryServices,
  ]);
  if (forbidden.has(component)) {
    throw new Error(
      `Registry interaction: ${component} must defer identity to Authoritative Registries (never mint SSOT identity)`,
    );
  }
}
