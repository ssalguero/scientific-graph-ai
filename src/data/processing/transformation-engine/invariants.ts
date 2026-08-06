/**
 * DATA Domain — Transformation invariants (DATA-P2 / DATA-P5 / DATA-I5).
 *
 * @packageDocumentation
 */

export const TRANSFORMATION_INVARIANTS = [
  "never-modify-source-authoritative-identity",
  "always-create-new-derived-entity",
  "lineage-must-be-preserved",
  "metadata-must-propagate",
  "execution-must-be-deterministic",
  "no-implicit-transformations",
  "no-silent-mutation-of-Available",
] as const;

export type TransformationInvariant = (typeof TRANSFORMATION_INVARIANTS)[number];

export class TransformationInvariantError extends Error {
  readonly invariant: TransformationInvariant;

  constructor(invariant: TransformationInvariant, detail: string) {
    super(`Transformation invariant violated (${invariant}): ${detail}`);
    this.name = "TransformationInvariantError";
    this.invariant = invariant;
  }
}
