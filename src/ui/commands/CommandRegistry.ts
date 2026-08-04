/**
 * UX-6.1 — Immutable Command Registry (query-only SSOT).
 *
 * Contract: CommandRegistryApi
 * Singleton: commandRegistry (empty by design — registration → UX-6.2)
 *
 * No mutators · no execution · no React.
 */

import type { CommandDefinition } from "./CommandDefinition";
import type { CommandId } from "./CommandTypes";

export const EMPTY_COMMAND_DEFINITIONS: readonly CommandDefinition[] =
  Object.freeze([]);

/**
 * Query-only registry contract.
 * Named CommandRegistryApi to avoid type/value name collision with the singleton.
 */
export interface CommandRegistryApi {
  get(id: CommandId): CommandDefinition | undefined;
  has(id: CommandId): boolean;
  size(): number;
  getAll(): readonly CommandDefinition[];
}

/**
 * Creates an immutable query-only registry.
 * Assumes valid input — registration validation is UX-6.2+.
 */
export function createCommandRegistry(
  definitions: readonly CommandDefinition[] = EMPTY_COMMAND_DEFINITIONS,
): CommandRegistryApi {
  const frozenDefinitions = definitions.map((def) =>
    Object.freeze({ ...def }),
  );
  const map = new Map<CommandId, CommandDefinition>(
    frozenDefinitions.map((def) => [def.id, def]),
  );
  const allDefinitions: readonly CommandDefinition[] =
    Object.freeze(frozenDefinitions);

  return Object.freeze({
    get(id: CommandId): CommandDefinition | undefined {
      return map.get(id);
    },
    has(id: CommandId): boolean {
      return map.has(id);
    },
    size(): number {
      return map.size;
    },
    getAll(): readonly CommandDefinition[] {
      return allDefinitions;
    },
  });
}

/** Empty singleton SSOT for UX-6.1 bootstrap (empty by design). */
export const commandRegistry: CommandRegistryApi = createCommandRegistry();
