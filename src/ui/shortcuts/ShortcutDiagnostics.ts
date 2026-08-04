/**
 * UX-6.4 — Shortcut Diagnostics (pure structural report).
 *
 * Pure TypeScript · no React · no Runtime · no side effects · no class.
 * Inspects registry size/ids/keys and construction-time duplicates.
 */

import type { ShortcutRegistryApi } from "./ShortcutRegistry";
import type { ShortcutId, ShortcutKey } from "./ShortcutTypes";

export type ShortcutDiagnosticsReport = Readonly<{
  count: number;
  ids: readonly ShortcutId[];
  shortcuts: readonly ShortcutKey[];
  duplicates: readonly ShortcutId[];
}>;

/**
 * Builds an immutable diagnostics report from registry + optional duplicates.
 * Pure function — no class, no mutation, no side effects.
 */
export function createShortcutDiagnosticsReport(
  registry: ShortcutRegistryApi,
  duplicates: readonly ShortcutId[] = [],
): ShortcutDiagnosticsReport {
  const definitions = registry.getAll();
  const ids = Object.freeze(definitions.map((def) => def.id));
  const shortcuts = Object.freeze(definitions.map((def) => def.key));

  return Object.freeze({
    count: registry.size(),
    ids,
    shortcuts,
    duplicates: Object.freeze([...duplicates]),
  });
}
