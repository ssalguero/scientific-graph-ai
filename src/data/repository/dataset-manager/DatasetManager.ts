/**
 * Dataset Manager — Authoritative Registry owner for datasets (DATA-P6 / DATA-I2).
 *
 * Owns dataset identity SSOT. Does not implement lifecycle, validation,
 * transformation, or repository publication.
 *
 * @packageDocumentation
 */

import type { AuthoritativeRegistry } from "../../internal/registry/authoritative-registry";
import type { RegistryAuthority } from "../../internal/registry/authority";
import type { DataEntityIdentity } from "../../internal/registry/identity";
import {
  assertDatasetMayReferenceModel,
} from "../../internal/registry/interaction";
import {
  DataEntityClass,
  DataOwnerComponent,
} from "../../internal/registry/roles";
import { asTransientView } from "../../internal/registry/transient-view";

export class DatasetManager {
  readonly registry: AuthoritativeRegistry;

  constructor(authority: RegistryAuthority) {
    this.registry = authority.claimAuthoritative(
      DataEntityClass.Dataset,
      DataOwnerComponent.DatasetManager,
    );
  }

  /** Mint / register a dataset identity under Dataset Manager authority. */
  registerDataset(id?: string): DataEntityIdentity {
    return this.registry.register(id);
  }

  hasDataset(id: string): boolean {
    return this.registry.has(id);
  }

  getDataset(id: string): DataEntityIdentity | undefined {
    return this.registry.get(id);
  }

  /** Reference a scientific-model identity (does not own it). */
  referenceScientificModel(modelIdentity: DataEntityIdentity): void {
    assertDatasetMayReferenceModel(modelIdentity);
  }

  /** Consumer-safe projection — Transient View, never SSOT. */
  listDatasetsTransient() {
    return asTransientView(this.registry.list());
  }
}
