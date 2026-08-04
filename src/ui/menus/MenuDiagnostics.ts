/**
 * UX-6.6 — Menu Diagnostics (pure structural report).
 *
 * Pure TypeScript · no React · no Runtime · no side effects · no class.
 * Inspects opaque tree via public helpers + optional registry for orphans.
 * duplicatedEntries is Builder-precomputed — Diagnostics only reads it.
 */

import type { CommandRegistryApi } from "../commands/CommandRegistry";
import type { CommandId } from "../commands/CommandTypes";
import {
  getMenuTreeDuplicatedEntries,
  getMenuTreeEntries,
  getMenuTreeMenus,
  type MenuTree,
} from "./MenuTree";
import type { MenuId } from "./MenuTypes";

export type MenuDiagnosticsReport = Readonly<{
  menus: readonly MenuId[];
  entries: readonly CommandId[];
  orphanCommands: readonly CommandId[];
  duplicatedEntries: readonly CommandId[];
}>;

/**
 * Builds an immutable diagnostics report from an opaque tree.
 * orphanCommands = entry CommandIds missing from the compared registry.
 * duplicatedEntries = Builder-precomputed set (via tree helpers).
 */
export function createMenuDiagnosticsReport(
  tree: MenuTree,
  registry?: CommandRegistryApi,
): MenuDiagnosticsReport {
  const menus = Object.freeze(getMenuTreeMenus(tree).map((menu) => menu.id));
  const entries = getMenuTreeEntries(tree);
  const duplicatedEntries = getMenuTreeDuplicatedEntries(tree);

  const orphanCommands =
    registry === undefined
      ? Object.freeze([] as CommandId[])
      : Object.freeze(
          entries.filter((commandId) => !registry.has(commandId)),
        );

  return Object.freeze({
    menus,
    entries,
    orphanCommands,
    duplicatedEntries,
  });
}
