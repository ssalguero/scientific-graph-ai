/**
 * UX-3.6 — Private selector equality helpers (pure, stateless).
 */

export function referenceEqual(a: unknown, b: unknown): boolean {
  return Object.is(a, b);
}

export function strictEqual(a: unknown, b: unknown): boolean {
  return a === b;
}

export function shallowEqual(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) {
    return true;
  }
  if (
    typeof a !== "object" ||
    a === null ||
    typeof b !== "object" ||
    b === null
  ) {
    return false;
  }

  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);
  if (aKeys.length !== bKeys.length) {
    return false;
  }

  const bRecord = b as Record<string, unknown>;
  for (const key of aKeys) {
    if (
      !Object.prototype.hasOwnProperty.call(b, key) ||
      !Object.is((a as Record<string, unknown>)[key], bRecord[key])
    ) {
      return false;
    }
  }
  return true;
}
