/**
 * UX-6.5 — Command Palette System local barrel.
 * Not re-exported from @/ui (src/ui/index.ts) in this phase.
 */

export type { CommandPaletteQueryText } from "./CommandPaletteTypes";

export type {
  CommandPaletteDefinition,
  CommandPaletteDefinitionInit,
} from "./CommandPaletteDefinition";
export { createCommandPaletteDefinition } from "./CommandPaletteDefinition";

export { createCommandPaletteCatalog } from "./CommandPaletteCatalog";

export type { CommandPaletteIndex } from "./CommandPaletteIndex";
export {
  createCommandPaletteIndex,
  getCommandPaletteIndexEntries,
  getCommandPaletteIndexKeywordReport,
  matchCommandPaletteIndex,
} from "./CommandPaletteIndex";

export { search } from "./CommandPaletteSearch";

export type { CommandPaletteDiagnosticsReport } from "./CommandPaletteDiagnostics";
export { createCommandPaletteDiagnosticsReport } from "./CommandPaletteDiagnostics";
