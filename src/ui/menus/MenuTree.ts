/**
 * UX-6.6 — MenuTree (opaque navigable hierarchy).
 *
 * Public contract: branded opaque handle + read helpers.
 * Internals (ordered menus / entries / duplicatedEntries) stay private via WeakMap.
 * No insert · no delete · no mutate · no React · no execution.
 */

import type { CommandId } from "../commands/CommandTypes";
import type { MenuId } from "./MenuTypes";

/**
 * Opaque public MenuTree contract.
 * No readable fields besides the brand — storage implementation is private.
 */
export type MenuTree = Readonly<{
  readonly __brand: "MenuTree";
}>;

export type MenuTreeMenuView = Readonly<{
  id: MenuId;
  title: string;
  entries: readonly CommandId[];
}>;

type TreeInternals = Readonly<{
  menus: readonly MenuTreeMenuView[];
  entries: readonly CommandId[];
  duplicatedEntries: readonly CommandId[];
}>;

const treeStore = new WeakMap<MenuTree, TreeInternals>();

function requireInternals(tree: MenuTree): TreeInternals {
  const internals = treeStore.get(tree);
  if (internals === undefined) {
    throw new Error("Invalid MenuTree handle.");
  }
  return internals;
}

/**
 * Seals an opaque MenuTree from already-validated, order-preserved internals.
 * Package construction entry used by MenuTreeBuilder only.
 */
export function sealMenuTree(internals: TreeInternals): MenuTree {
  const handle: MenuTree = Object.freeze({
    __brand: "MenuTree" as const,
  });

  treeStore.set(
    handle,
    Object.freeze({
      menus: Object.freeze(
        internals.menus.map((menu) =>
          Object.freeze({
            id: menu.id,
            title: menu.title,
            entries: Object.freeze([...menu.entries]),
          }),
        ),
      ),
      entries: Object.freeze([...internals.entries]),
      duplicatedEntries: Object.freeze([...internals.duplicatedEntries]),
    }),
  );

  return handle;
}

/**
 * Returns menus in sealed catalog order (id + title + entry CommandIds).
 * Public helper for Diagnostics — does not expose storage shape.
 */
export function getMenuTreeMenus(tree: MenuTree): readonly MenuTreeMenuView[] {
  return requireInternals(tree).menus;
}

/**
 * Returns all entry CommandIds in sealed catalog order (flattened).
 */
export function getMenuTreeEntries(tree: MenuTree): readonly CommandId[] {
  return requireInternals(tree).entries;
}

/**
 * Returns Builder-precomputed duplicated CommandIds.
 * Diagnostics must read this — not recompute from scratch.
 */
export function getMenuTreeDuplicatedEntries(
  tree: MenuTree,
): readonly CommandId[] {
  return requireInternals(tree).duplicatedEntries;
}
