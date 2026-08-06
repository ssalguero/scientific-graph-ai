/**
 * DATA Domain — Metadata invariants (DATA-P6 / DATA-I4).
 *
 * @packageDocumentation
 */

export const METADATA_INVARIANTS = [
  "metadata-never-mints-identity",
  "metadata-never-replaces-authoritative-registry",
  "lineage-preserves-parent-identity",
  "provenance-never-modifies-ownership",
  "metadata-accompanies-entity",
  "supporting-registry-only",
] as const;

export type MetadataInvariant = (typeof METADATA_INVARIANTS)[number];

export class MetadataInvariantError extends Error {
  readonly invariant: MetadataInvariant;

  constructor(invariant: MetadataInvariant, detail: string) {
    super(`Metadata invariant violated (${invariant}): ${detail}`);
    this.name = "MetadataInvariantError";
    this.invariant = invariant;
  }
}
