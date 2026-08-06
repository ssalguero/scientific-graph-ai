/**
 * DATA Domain — Registry Authority / SSOT + Shadow prevention (DATA-P6).
 *
 * Exactly one Authoritative Registry per entity class.
 * Second claim → Ownership Escalation (shadow / dual SSOT forbidden).
 *
 * @packageDocumentation
 */

import { AuthoritativeRegistry } from "./authoritative-registry";
import { escalateOwnershipConflict } from "./escalation";
import type { DataEntityIdentity } from "./identity";
import { authoritativeOwnerFor } from "./ownership";
import type { DataEntityClass, DataOwnerComponent } from "./roles";
import { DataRegistryRole } from "./roles";

export class RegistryAuthority {
  private readonly authoritative = new Map<
    DataEntityClass,
    AuthoritativeRegistry
  >();

  /**
   * Claim and create the sole Authoritative Registry for an entity class.
   * A second claim for the same class escalates ownership conflict.
   */
  claimAuthoritative(
    entityClass: DataEntityClass,
    ownerComponent: DataOwnerComponent,
  ): AuthoritativeRegistry {
    const existing = this.authoritative.get(entityClass);
    if (existing) {
      escalateOwnershipConflict(`AuthoritativeRegistry:${entityClass}`, [
        existing.ownerComponent,
        ownerComponent,
      ]);
    }
    const expected = authoritativeOwnerFor(entityClass);
    if (ownerComponent !== expected) {
      escalateOwnershipConflict(`AuthoritativeOwner:${entityClass}`, [
        ownerComponent,
        expected,
      ]);
    }
    const registry = new AuthoritativeRegistry(entityClass, ownerComponent);
    this.authoritative.set(entityClass, registry);
    return registry;
  }

  getAuthoritative(
    entityClass: DataEntityClass,
  ): AuthoritativeRegistry | undefined {
    return this.authoritative.get(entityClass);
  }

  /** Resolve identity across all Authoritative Registries (SSOT lookup). */
  resolveIdentity(id: string): DataEntityIdentity | undefined {
    for (const registry of this.authoritative.values()) {
      const found = registry.get(id);
      if (found) return found;
    }
    return undefined;
  }

  /**
   * Reject attempts to treat a non-authoritative role as identity SSOT.
   */
  assertNotShadowIdentitySource(role: string, entityClass: DataEntityClass): void {
    if (
      role === DataRegistryRole.Supporting ||
      role === DataRegistryRole.Derived ||
      role === DataRegistryRole.TransientView
    ) {
      throw new Error(
        `Shadow Registry prevention: role "${role}" must not mint authoritative identity for ${entityClass}`,
      );
    }
  }

  /** Prevent feedstock / external paths from being treated as Authoritative. */
  rejectExternalAuthority(sourceLabel: string): never {
    throw new Error(
      `Shadow Registry prevention: "${sourceLabel}" is not an Authoritative Registry (DATA-P6). Feedstock, Platform storage, UI, and consumer caches are never SSOT.`,
    );
  }
}
