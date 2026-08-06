/**
 * DATA Domain — Authoritative Registry (DATA-P6 / DATA-I2).
 *
 * Sole semantic authority for one entity class. Identity only — no lifecycle,
 * no scientific payloads, no persistence engines.
 *
 * @packageDocumentation
 */

import {
  mintIdentityId,
  type DataEntityIdentity,
} from "./identity";
import { authoritativeOwnerFor } from "./ownership";
import { escalateOwnershipConflict } from "./escalation";
import type { DataEntityClass, DataOwnerComponent } from "./roles";

export class AuthoritativeRegistry {
  private readonly entries = new Map<string, DataEntityIdentity>();

  constructor(
    readonly entityClass: DataEntityClass,
    readonly ownerComponent: DataOwnerComponent,
  ) {
    const expected = authoritativeOwnerFor(entityClass);
    if (ownerComponent !== expected) {
      escalateOwnershipConflict(`AuthoritativeRegistry:${entityClass}`, [
        ownerComponent,
        expected,
      ]);
    }
  }

  /** Register a new authoritative identity (SSOT mint). */
  register(id?: string): DataEntityIdentity {
    const identityId = id ?? mintIdentityId(this.entityClass);
    if (this.entries.has(identityId)) {
      throw new Error(
        `AuthoritativeRegistry(${this.entityClass}): identity already registered: ${identityId}`,
      );
    }
    const identity: DataEntityIdentity = {
      id: identityId,
      entityClass: this.entityClass,
      ownerComponent: this.ownerComponent,
    };
    this.entries.set(identityId, identity);
    return identity;
  }

  has(id: string): boolean {
    return this.entries.has(id);
  }

  get(id: string): DataEntityIdentity | undefined {
    return this.entries.get(id);
  }

  /** Snapshot of identities — Transient View material; not a second SSOT. */
  list(): readonly DataEntityIdentity[] {
    return Object.freeze([...this.entries.values()]);
  }

  get size(): number {
    return this.entries.size;
  }
}
