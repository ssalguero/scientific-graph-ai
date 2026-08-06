/**
 * DATA Domain — Registry identity (DATA-P6 / DATA-I2).
 *
 * Identity is semantic authority, not storage and not lifecycle state.
 * DATA-I2 does not track P5 lifecycle phases.
 *
 * @packageDocumentation
 */

import type { DataEntityClass, DataOwnerComponent } from "./roles";

/** Opaque authoritative identity — no scientific payload. */
export interface DataEntityIdentity {
  readonly id: string;
  readonly entityClass: DataEntityClass;
  readonly ownerComponent: DataOwnerComponent;
}

let identitySeq = 0;

/** Mint an opaque identity id (implementation detail; not a public API). */
export function mintIdentityId(prefix: string): string {
  identitySeq += 1;
  return `${prefix}-${identitySeq}`;
}

/** Reset mint counter — test / composition hygiene only. */
export function resetIdentityMintCounter(): void {
  identitySeq = 0;
}
