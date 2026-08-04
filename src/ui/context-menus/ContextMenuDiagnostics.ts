/**
 * UX-6.8 — Context Menu Diagnostics (pure structural report).
 *
 * Pure TypeScript · no React · no Runtime · no side effects · no class.
 * Inspects opaque contextMenus via package-internal helpers + optional registry for orphans.
 * duplicatedItems is Builder-precomputed — Diagnostics only reads it.
 * Sole intended consumer of ContextMenus.ts read helpers.
 */

import type { CommandRegistryApi } from "../commands/CommandRegistry";
import type { CommandId } from "../commands/CommandTypes";
import {
  getContextMenusDuplicatedItems,
  getContextMenusEntries,
  getContextMenusItems,
  type ContextMenus,
} from "./ContextMenus";
import type { ContextMenuId } from "./ContextMenuTypes";

export type ContextMenuDiagnosticsReport = Readonly<{
  contextMenus: readonly ContextMenuId[];
  items: readonly CommandId[];
  orphanCommands: readonly CommandId[];
  duplicatedItems: readonly CommandId[];
}>;

/**
 * Builds an immutable diagnostics report from an opaque ContextMenus.
 * orphanCommands = item CommandIds missing from the compared registry.
 * duplicatedItems = Builder-precomputed set (via package-internal helpers).
 */
export function createContextMenuDiagnosticsReport(
  contextMenus: ContextMenus,
  registry?: CommandRegistryApi,
): ContextMenuDiagnosticsReport {
  const menuIds = Object.freeze(
    getContextMenusEntries(contextMenus).map((entry) => entry.id),
  );
  const items = getContextMenusItems(contextMenus);
  const duplicatedItems = getContextMenusDuplicatedItems(contextMenus);

  const orphanCommands =
    registry === undefined
      ? Object.freeze([] as CommandId[])
      : Object.freeze(
          items.filter((commandId) => !registry.has(commandId)),
        );

  return Object.freeze({
    contextMenus: menuIds,
    items,
    orphanCommands,
    duplicatedItems,
  });
}
