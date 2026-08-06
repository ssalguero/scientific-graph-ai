/**
 * Scientific Model Manager — Authoritative Registry owner for scientific model
 * entities (DATA-P6 / DATA-I2).
 *
 * Owns model-entity identity SSOT. No lifecycle, validation, or processing.
 *
 * @packageDocumentation
 */

import type { AuthoritativeRegistry } from "../../internal/registry/authoritative-registry";
import type { RegistryAuthority } from "../../internal/registry/authority";
import type { DataEntityIdentity } from "../../internal/registry/identity";
import {
  DataEntityClass,
  DataOwnerComponent,
} from "../../internal/registry/roles";
import { asTransientView } from "../../internal/registry/transient-view";

export class ScientificModelManager {
  readonly registry: AuthoritativeRegistry;

  constructor(authority: RegistryAuthority) {
    this.registry = authority.claimAuthoritative(
      DataEntityClass.ScientificModelEntity,
      DataOwnerComponent.ScientificModelManager,
    );
  }

  /** Mint / register a scientific model entity identity. */
  registerModelEntity(id?: string): DataEntityIdentity {
    return this.registry.register(id);
  }

  hasModelEntity(id: string): boolean {
    return this.registry.has(id);
  }

  getModelEntity(id: string): DataEntityIdentity | undefined {
    return this.registry.get(id);
  }

  listModelEntitiesTransient() {
    return asTransientView(this.registry.list());
  }
}
