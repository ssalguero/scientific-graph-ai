/**
 * UX-6.5 — Command Palette Diagnostics (pure structural report).
 *
 * Pure TypeScript · no React · no Runtime · no side effects · no class.
 * Inspects opaque index via public helpers + optional registry for orphans.
 */

import type { CommandRegistryApi } from "../commands/CommandRegistry";
import type { CommandId } from "../commands/CommandTypes";
import {
  getCommandPaletteIndexEntries,
  getCommandPaletteIndexKeywordReport,
  type CommandPaletteIndex,
} from "./CommandPaletteIndex";

export type CommandPaletteDiagnosticsReport = Readonly<{
  entries: readonly CommandId[];
  keywords: readonly string[];
  duplicatedKeywords: readonly string[];
  orphanEntries: readonly CommandId[];
}>;

/**
 * Builds an immutable diagnostics report from an opaque index.
 * orphanEntries = indexed CommandIds missing from the compared registry
 * (normally empty when the index was built from that same registry).
 */
export function createCommandPaletteDiagnosticsReport(
  index: CommandPaletteIndex,
  registry?: CommandRegistryApi,
): CommandPaletteDiagnosticsReport {
  const entries = getCommandPaletteIndexEntries(index);
  const { keywords, duplicatedKeywords } =
    getCommandPaletteIndexKeywordReport(index);

  const orphanEntries =
    registry === undefined
      ? Object.freeze([] as CommandId[])
      : Object.freeze(
          entries.filter((commandId) => !registry.has(commandId)),
        );

  return Object.freeze({
    entries,
    keywords,
    duplicatedKeywords,
    orphanEntries,
  });
}
