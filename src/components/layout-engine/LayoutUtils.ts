/**
 * D54.2 — Shared pure utilities for the Layout Engine.
 * No React. No DOM. No side effects.
 */

export function isPlainObject(
  value: unknown
): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

export function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

/**
 * Shallow-clone a record of values via a mapper. Does not mutate the source.
 */
export function mapRecord<T, U>(
  source: Record<string, T>,
  mapFn: (value: T, key: string) => U
): Record<string, U> {
  const next: Record<string, U> = {};
  for (const key of Object.keys(source)) {
    next[key] = mapFn(source[key], key);
  }
  return next;
}
