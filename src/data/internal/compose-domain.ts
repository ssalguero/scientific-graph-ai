/**
 * DATA Domain — Domain composition root (DATA-I2 … DATA-I6).
 *
 * Registries + Lifecycle + Validation + Metadata + Transformation + Repository.
 * DATA-internal only. No public capability facades. No persistence engines.
 *
 * @packageDocumentation
 */

import { composeDataRegistries } from "./compose-registries";
import { LifecycleTracker } from "./lifecycle/lifecycle-tracker";
import { ValidationEngine } from "../validation/validation-engine/ValidationEngine";
import { TransformationEngine } from "../processing/transformation-engine/TransformationEngine";
import { RepositoryServices } from "../repository/repository-services/RepositoryServices";
import type { DataRegistryComposition } from "./compose-registries";

export interface DataDomainComposition extends DataRegistryComposition {
  readonly validationEngine: ValidationEngine;
  readonly lifecycle: LifecycleTracker;
  readonly transformationEngine: TransformationEngine;
  readonly repositoryServices: RepositoryServices;
}

/** Compose DATA domain kernel through DATA-I6. */
export function composeDataDomain(): DataDomainComposition {
  const registries = composeDataRegistries();
  const validationEngine = new ValidationEngine();
  const lifecycle = new LifecycleTracker(
    registries.authority,
    validationEngine,
  );
  const transformationEngine = new TransformationEngine({
    authority: registries.authority,
    datasetManager: registries.datasetManager,
    scientificModelManager: registries.scientificModelManager,
    lifecycle,
    metadataManager: registries.metadataManager,
  });
  const repositoryServices = new RepositoryServices({
    authority: registries.authority,
    lifecycle,
    validationEngine,
  });
  return {
    ...registries,
    validationEngine,
    lifecycle,
    transformationEngine,
    repositoryServices,
  };
}
