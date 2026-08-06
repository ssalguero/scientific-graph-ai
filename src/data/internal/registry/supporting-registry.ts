/**
 * DATA Domain — Supporting Registry (DATA-P6 / DATA-I2).
 *
 * Authoritative for subordinate associations bound to Authoritative identities.
 * Never invents entity identity. Never becomes a rival SSOT.
 *
 * DATA-I2: wiring only — association keys bound to identities; no metadata
 * field semantics (DATA-I4).
 *
 * @packageDocumentation
 */

import type { DataEntityIdentity } from "./identity";
import { mintIdentityId } from "./identity";

export interface SupportingAssociation {
  readonly associationId: string;
  readonly authoritativeIdentity: DataEntityIdentity;
}

export type AuthoritativeIdentityResolver = (
  id: string,
) => DataEntityIdentity | undefined;

/**
 * Supporting Registry — binds associations to existing authoritative identities.
 */
export class SupportingRegistry {
  private readonly associations = new Map<string, SupportingAssociation>();

  constructor(
    readonly name: string,
    private readonly resolveAuthoritative: AuthoritativeIdentityResolver,
  ) {}

  /**
   * Bind a supporting association to an existing authoritative identity.
   * Fails if the identity is not known to an Authoritative Registry.
   */
  bind(
    authoritativeId: string,
    associationId?: string,
  ): SupportingAssociation {
    const identity = this.resolveAuthoritative(authoritativeId);
    if (!identity) {
      throw new Error(
        `SupportingRegistry(${this.name}): cannot bind — authoritative identity not found: ${authoritativeId}`,
      );
    }
    const id = associationId ?? mintIdentityId(`${this.name}-assoc`);
    if (this.associations.has(id)) {
      throw new Error(
        `SupportingRegistry(${this.name}): association already exists: ${id}`,
      );
    }
    const association: SupportingAssociation = {
      associationId: id,
      authoritativeIdentity: identity,
    };
    this.associations.set(id, association);
    return association;
  }

  get(associationId: string): SupportingAssociation | undefined {
    return this.associations.get(associationId);
  }

  listFor(authoritativeId: string): readonly SupportingAssociation[] {
    return Object.freeze(
      [...this.associations.values()].filter(
        (a) => a.authoritativeIdentity.id === authoritativeId,
      ),
    );
  }

  get size(): number {
    return this.associations.size;
  }
}
