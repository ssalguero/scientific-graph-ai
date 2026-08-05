/**
 * UX-8.3 — Immutable SelectionSet snapshot.
 *
 * Set-based internally · clone-on-read · no metadata · no timestamps ·
 * no ordering contract · no public mutators.
 *
 * Set Ownership Freeze: consumers receive SelectionSet only — never the
 * Registry's private mutable Sets.
 */

export type SelectionSet<T> = Readonly<{
  readonly size: number;
  has(id: T): boolean;
  values(): IterableIterator<T>;
  [Symbol.iterator](): IterableIterator<T>;
}>;

/**
 * Builds an immutable SelectionSet snapshot.
 * Clones the iterable into a private Set; exposes no mutators.
 */
export function createSelectionSet<T>(ids?: Iterable<T>): SelectionSet<T> {
  const inner = new Set<T>(ids);
  return Object.freeze({
    get size(): number {
      return inner.size;
    },
    has(id: T): boolean {
      return inner.has(id);
    },
    values(): IterableIterator<T> {
      return inner.values();
    },
    [Symbol.iterator](): IterableIterator<T> {
      return inner.values();
    },
  });
}

/** Empty selection set snapshot. */
export const EMPTY_SELECTION_SET: SelectionSet<never> = createSelectionSet();
