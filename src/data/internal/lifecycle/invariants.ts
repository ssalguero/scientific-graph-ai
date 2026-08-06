/**
 * DATA Domain — Lifecycle Invariants (DATA-P5 §6 / DATA-I3).
 *
 * @packageDocumentation
 */

export const LIFECYCLE_INVARIANTS = [
  "exactly-one-current-lifecycle-state",
  "never-skip-mandatory-transitions",
  "never-lose-lineage",
  "never-lose-metadata-continuity",
  "never-change-ownership-through-lifecycle",
  "never-become-Available-without-successful-Validation",
  "never-mutate-silently-after-publication",
] as const;

export type LifecycleInvariant = (typeof LIFECYCLE_INVARIANTS)[number];

export class LifecycleInvariantError extends Error {
  readonly invariant: LifecycleInvariant;

  constructor(invariant: LifecycleInvariant, detail: string) {
    super(`Lifecycle invariant violated (${invariant}): ${detail}`);
    this.name = "LifecycleInvariantError";
    this.invariant = invariant;
  }
}
