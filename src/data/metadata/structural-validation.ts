/**
 * DATA Domain — Metadata structural validation (DATA-I4).
 *
 * Structure only — not scientific correctness (later stages).
 *
 * @packageDocumentation
 */

import type { RegistryAuthority } from "../internal/registry/authority";
import { MetadataInvariantError } from "./invariants";
import type { MetadataRecord } from "./model";

export interface StructuralValidationResult {
  readonly ok: boolean;
  readonly errors: readonly string[];
}

export function validateMetadataStructure(
  record: MetadataRecord,
  authority: RegistryAuthority,
): StructuralValidationResult {
  const errors: string[] = [];

  const identity = authority.resolveIdentity(record.authoritativeIdentityId);
  if (!identity) {
    errors.push(
      `authoritative identity not found: ${record.authoritativeIdentityId}`,
    );
  }

  for (const link of record.lineage.links) {
    if (link.parentIdentityId === record.authoritativeIdentityId) {
      errors.push(
        `lineage must not alias self as parent: ${link.parentIdentityId}`,
      );
    }
    if (!authority.resolveIdentity(link.parentIdentityId)) {
      errors.push(
        `lineage parent is not an authoritative identity: ${link.parentIdentityId}`,
      );
    }
  }

  if (!record.associationId) {
    errors.push("associationId is required");
  }

  return { ok: errors.length === 0, errors: Object.freeze(errors) };
}

export function assertMetadataStructure(
  record: MetadataRecord,
  authority: RegistryAuthority,
): void {
  const result = validateMetadataStructure(record, authority);
  if (!result.ok) {
    throw new MetadataInvariantError(
      "metadata-accompanies-entity",
      result.errors.join("; "),
    );
  }
}
