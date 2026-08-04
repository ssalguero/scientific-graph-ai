/**
 * UX-6.7 — Toolbar Diagnostics (pure structural report).
 *
 * Pure TypeScript · no React · no Runtime · no side effects · no class.
 * Inspects opaque toolbar via package-internal helpers + optional registry for orphans.
 * duplicatedItems is Builder-precomputed — Diagnostics only reads it.
 * Sole intended consumer of Toolbar.ts read helpers.
 */

import type { CommandRegistryApi } from "../commands/CommandRegistry";
import type { CommandId } from "../commands/CommandTypes";
import {
  getToolbarDuplicatedItems,
  getToolbarItems,
  getToolbarToolbars,
  type Toolbar,
} from "./Toolbar";
import type { ToolbarId } from "./ToolbarTypes";

export type ToolbarDiagnosticsReport = Readonly<{
  toolbars: readonly ToolbarId[];
  items: readonly CommandId[];
  orphanCommands: readonly CommandId[];
  duplicatedItems: readonly CommandId[];
}>;

/**
 * Builds an immutable diagnostics report from an opaque toolbar.
 * orphanCommands = item CommandIds missing from the compared registry.
 * duplicatedItems = Builder-precomputed set (via package-internal helpers).
 */
export function createToolbarDiagnosticsReport(
  toolbar: Toolbar,
  registry?: CommandRegistryApi,
): ToolbarDiagnosticsReport {
  const toolbars = Object.freeze(
    getToolbarToolbars(toolbar).map((entry) => entry.id),
  );
  const items = getToolbarItems(toolbar);
  const duplicatedItems = getToolbarDuplicatedItems(toolbar);

  const orphanCommands =
    registry === undefined
      ? Object.freeze([] as CommandId[])
      : Object.freeze(
          items.filter((commandId) => !registry.has(commandId)),
        );

  return Object.freeze({
    toolbars,
    items,
    orphanCommands,
    duplicatedItems,
  });
}
