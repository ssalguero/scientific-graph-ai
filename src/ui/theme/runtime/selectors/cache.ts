/**
 * UX-3.6 — Private ephemeral selector result cache (WeakMap).
 *
 * Architecture: WeakMap<ThemeRuntime, WeakMap<Function, unknown>>
 * - Selector identity = function reference (never serialized)
 * - Stores results only; never exposed; GC when runtime is unreachable
 */

import type { ThemeRuntime } from "./ThemeSelector";

const store = new WeakMap<object, WeakMap<Function, unknown>>();

export function has(runtime: ThemeRuntime, selector: Function): boolean {
  const bySelector = store.get(runtime);
  if (!bySelector) {
    return false;
  }
  return bySelector.has(selector);
}

export function get(
  runtime: ThemeRuntime,
  selector: Function,
): unknown | undefined {
  const bySelector = store.get(runtime);
  if (!bySelector) {
    return undefined;
  }
  return bySelector.get(selector);
}

export function set(
  runtime: ThemeRuntime,
  selector: Function,
  result: unknown,
): void {
  let bySelector = store.get(runtime);
  if (!bySelector) {
    bySelector = new WeakMap<Function, unknown>();
    store.set(runtime, bySelector);
  }
  bySelector.set(selector, result);
}

/** Test-only: no-op for WeakMap (entries are ephemeral / GC-bound). */
export function clear(): void {
  // WeakMap cannot be cleared; intentional no-op for gate smoke.
}
