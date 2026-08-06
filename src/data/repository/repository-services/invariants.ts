/**
 * DATA Domain — Repository invariants (DATA-P2 / P6 / DATA-I6).
 *
 * @packageDocumentation
 */

export const REPOSITORY_INVARIANTS = [
  "repository-never-creates-identity",
  "repository-never-modifies-lifecycle",
  "repository-never-modifies-ownership",
  "repository-never-replaces-registry",
  "publish-only-eligible-entities",
  "discover-only-published-entities",
  "publication-never-bypasses-validation-gate",
  "repository-never-bypasses-authoritative-registry",
  "repository-queries-registry-owns",
  "no-persistence-engines",
] as const;

export type RepositoryInvariant = (typeof REPOSITORY_INVARIANTS)[number];

export class RepositoryInvariantError extends Error {
  readonly invariant: RepositoryInvariant;

  constructor(invariant: RepositoryInvariant, detail: string) {
    super(`Repository invariant violated (${invariant}): ${detail}`);
    this.name = "RepositoryInvariantError";
    this.invariant = invariant;
  }
}
