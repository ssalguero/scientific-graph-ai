/**
 * UX-6.5 — Command Palette Catalog (projection from commandRegistry).
 *
 * Sole data source: registry.getAll().
 * No seed · no parallel command catalog · no React.
 */

import type { CommandRegistryApi } from "../commands/CommandRegistry";
import {
  createCommandPaletteDefinition,
  type CommandPaletteDefinition,
} from "./CommandPaletteDefinition";

/**
 * Projects commandRegistry.getAll() into an immutable palette catalog.
 * Does not own commands — CommandRegistry remains the SSOT.
 */
export function createCommandPaletteCatalog(
  registry: CommandRegistryApi,
): readonly CommandPaletteDefinition[] {
  const definitions = registry.getAll().map((def) =>
    createCommandPaletteDefinition({ commandId: def.id }),
  );
  return Object.freeze(definitions);
}
