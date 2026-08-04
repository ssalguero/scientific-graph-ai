/**
 * UX-6.7 — Toolbar (opaque ordered collection).
 *
 * Public contract: branded opaque handle only.
 * Internals (ordered toolbars / items / duplicatedItems) stay private via WeakMap.
 * Read helpers are package-internal — consumed only by ToolbarDiagnostics.
 * No insert · no delete · no mutate · no React · no execution.
 */

import type { CommandId } from "../commands/CommandTypes";
import type { ToolbarId } from "./ToolbarTypes";

/**
 * Opaque public Toolbar contract.
 * No readable fields besides the brand — storage implementation is private.
 */
export type Toolbar = Readonly<{
  readonly __brand: "Toolbar";
}>;

/** Package-internal view of a sealed toolbar (id + ordered item CommandIds). */
export type ToolbarView = Readonly<{
  id: ToolbarId;
  items: readonly CommandId[];
}>;

type ToolbarInternals = Readonly<{
  toolbars: readonly ToolbarView[];
  items: readonly CommandId[];
  duplicatedItems: readonly CommandId[];
}>;

const toolbarStore = new WeakMap<Toolbar, ToolbarInternals>();

function requireInternals(toolbar: Toolbar): ToolbarInternals {
  const internals = toolbarStore.get(toolbar);
  if (internals === undefined) {
    throw new Error("Invalid Toolbar handle.");
  }
  return internals;
}

/**
 * Seals an opaque Toolbar from already-validated, order-preserved internals.
 * Package construction entry used by ToolbarBuilder only.
 */
export function sealToolbar(internals: ToolbarInternals): Toolbar {
  const handle: Toolbar = Object.freeze({
    __brand: "Toolbar" as const,
  });

  toolbarStore.set(
    handle,
    Object.freeze({
      toolbars: Object.freeze(
        internals.toolbars.map((toolbar) =>
          Object.freeze({
            id: toolbar.id,
            items: Object.freeze([...toolbar.items]),
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
 * Returns toolbars in sealed catalog order (id + item CommandIds).
 * Package-internal — for ToolbarDiagnostics only. Not re-exported from barrel.
 */
export function getToolbarToolbars(toolbar: Toolbar): readonly ToolbarView[] {
  return requireInternals(toolbar).toolbars;
}

/**
 * Returns all item CommandIds in sealed catalog order (flattened).
 * Package-internal — for ToolbarDiagnostics only. Not re-exported from barrel.
 */
export function getToolbarItems(toolbar: Toolbar): readonly CommandId[] {
  return requireInternals(toolbar).items;
}

/**
 * Returns Builder-precomputed duplicated CommandIds.
 * Package-internal — Diagnostics must read this — not recompute from scratch.
 */
export function getToolbarDuplicatedItems(
  toolbar: Toolbar,
): readonly CommandId[] {
  return requireInternals(toolbar).duplicatedItems;
}
