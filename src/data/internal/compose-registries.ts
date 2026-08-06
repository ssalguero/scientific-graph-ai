/**
 * DATA Domain — Registry composition root (DATA-I2).
 *
 * Wires Authoritative + Supporting registries under a single RegistryAuthority.
 * DATA-internal only. No public capability facades. No lifecycle. No science.
 *
 * @packageDocumentation
 */

import { RegistryAuthority } from "./registry/authority";
import { DatasetManager } from "../repository/dataset-manager/DatasetManager";
import { ScientificModelManager } from "../model/scientific-model-manager/ScientificModelManager";
import { MetadataManager } from "../metadata/MetadataManager";

export interface DataRegistryComposition {
  readonly authority: RegistryAuthority;
  readonly datasetManager: DatasetManager;
  readonly scientificModelManager: ScientificModelManager;
  readonly metadataManager: MetadataManager;
}

/** Compose the DATA-I2 registry / ownership kernel. */
export function composeDataRegistries(): DataRegistryComposition {
  const authority = new RegistryAuthority();
  const datasetManager = new DatasetManager(authority);
  const scientificModelManager = new ScientificModelManager(authority);
  const metadataManager = new MetadataManager(authority);
  return {
    authority,
    datasetManager,
    scientificModelManager,
    metadataManager,
  };
}
