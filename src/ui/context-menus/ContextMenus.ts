/**
 * UX-6.8 — ContextMenus (opaque ordered collection).
 *
 * Public contract: branded opaque handle only.
 * Internals (ordered contextMenus / items / duplicatedItems) stay private via WeakMap.
 * Read helpers are package-internal — consumed only by ContextMenuDiagnostics.
 * No insert · no delete · no mutate · no React · no execution.
 */

import type { CommandId } from "../commands/CommandTypes";
import type { ContextMenuId } from "./ContextMenuTypes";

/**
 * Opaque public ContextMenus contract.
 * No readable fields besides the brand — storage implementation is private.
 */
export type ContextMenus = Readonly<{
  readonly __brand: "ContextMenus";
}>;

/** Package-internal view of a sealed context menu (id + ordered item CommandIds). */
export type ContextMenuView = Readonly<{
  id: ContextMenuId;
  items: readonly CommandId[];
}>;

type ContextMenusInternals = Readonly<{
  contextMenus: readonly ContextMenuView[];
  items: readonly CommandId[];
  duplicatedItems: readonly CommandId[];
}>;

const contextMenusStore = new WeakMap<ContextMenus, ContextMenusInternals>();

function requireInternals(contextMenus: ContextMenus): ContextMenusInternals {
  const internals = contextMenusStore.get(contextMenus);
  if (internals === undefined) {
    throw new Error("Invalid ContextMenus handle.");
  }
  return internals;
}

/**
 * Seals an opaque ContextMenus from already-validated, order-preserved internals.
 * Package construction entry used by ContextMenuBuilder only.
 */
export function sealContextMenus(
  internals: ContextMenusInternals,
): ContextMenus {
  const handle: ContextMenus = Object.freeze({
    __brand: "ContextMenus" as const,
  });

  contextMenusStore.set(
    handle,
    Object.freeze({
      contextMenus: Object.freeze(
        internals.contextMenus.map((menu) =>
          Object.freeze({
            id: menu.id,
            items: Object.freeze([...menu.items]),
          }),
        ),
      ),
      items: Object.freeze([...internals.items]),
      duplicatedItems: Object.freeze([...internals.duplicatedItems]),
    }),
  );

  return handle;
}

/**
 * Returns context menus in sealed catalog order (id + item CommandIds).
 * Package-internal — for ContextMenuDiagnostics only. Not re-exported from barrel.
 */
export function getContextMenusEntries(
  contextMenus: ContextMenus,
): readonly ContextMenuView[] {
  return requireInternals(contextMenus).contextMenus;
}

/**
 * Returns all item CommandIds in sealed catalog order (flattened).
 * Package-internal — for ContextMenuDiagnostics only. Not re-exported from barrel.
 */
export function getContextMenusItems(
  contextMenus: ContextMenus,
): readonly CommandId[] {
  return requireInternals(contextMenus).items;
}

/**
 * Returns Builder-precomputed duplicated CommandIds.
 * Package-internal — Diagnostics must read this — not recompute from scratch.
 */
export function getContextMenusDuplicatedItems(
  contextMenus: ContextMenus,
): readonly CommandId[] {
  return requireInternals(contextMenus).duplicatedItems;
}
