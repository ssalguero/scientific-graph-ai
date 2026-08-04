/**
 * UX-6.9 — Structural UX metrics (aggregation from public reports only).
 *
 * Pure TypeScript · no React · no Runtime · no side effects · no class.
 * Counts and lengths only — no timers, performance, profiling, or telemetry.
 */

import type { UXDiagnosticsInput } from "./UXDiagnosticsTypes";

export type UXMetricsReport = Readonly<{
  totalCommandsReferenced: number;
  totalMenus: number;
  totalToolbarItems: number;
  totalContextMenus: number;
  totalShortcuts: number;
  orphanCommands: number;
  duplicatedEntries: number;
}>;

/**
 * Derives structural metrics exclusively from public report fields.
 * Does not recalculate orphans/duplicates — only sums existing lengths.
 */
export function createUXMetrics(input: UXDiagnosticsInput): UXMetricsReport {
  const orphanCommands =
    input.palette.orphanEntries.length +
    input.menus.orphanCommands.length +
    input.toolbar.orphanCommands.length +
    input.contextMenus.orphanCommands.length;

  const duplicatedEntries =
    input.shortcuts.duplicates.length +
    input.palette.duplicatedKeywords.length +
    input.menus.duplicatedEntries.length +
    input.toolbar.duplicatedItems.length +
    input.contextMenus.duplicatedItems.length;

  return Object.freeze({
    totalCommandsReferenced: input.commands.count,
    totalMenus: input.menus.menus.length,
    totalToolbarItems: input.toolbar.items.length,
    totalContextMenus: input.contextMenus.contextMenus.length,
    totalShortcuts: input.shortcuts.count,
    orphanCommands,
    duplicatedEntries,
  });
}
