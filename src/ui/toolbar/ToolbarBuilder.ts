/**
 * UX-6.7 — Toolbar Builder.
 *
 * Pipeline: validate → freeze → preserve order → seal.
 * Consumes TOOLBAR_CATALOG by default.
 * Build-time only — no dynamic mutation · no React · no execution.
 *
 * Structural hard failures: duplicate ToolbarId · empty catalog · empty items (throw).
 * Content findings: duplicatedItems recorded on the sealed Toolbar.
 * Order: exact TOOLBAR_CATALOG order (public contract — no sorting).
 */

import type { CommandId } from "../commands/CommandTypes";
import { TOOLBAR_CATALOG } from "./ToolbarCatalog";
import type { ToolbarDefinition } from "./ToolbarDefinition";
import {
  sealToolbar,
  type Toolbar,
  type ToolbarView,
} from "./Toolbar";
import type { ToolbarId } from "./ToolbarTypes";

/**
 * Builds an opaque Toolbar from a catalog.
 * Preserves toolbar and item order exactly as declared.
 */
export function buildToolbar(
  catalog: readonly ToolbarDefinition[] = TOOLBAR_CATALOG,
): Toolbar {
  // --- validate ---
  if (catalog.length === 0) {
    throw new Error("Toolbar catalog must not be empty.");
  }

  const seenToolbarIds = new Set<ToolbarId>();
  for (const toolbar of catalog) {
    if (seenToolbarIds.has(toolbar.id)) {
      throw new Error(
        `Duplicate ToolbarId in toolbar catalog: ${String(toolbar.id)}`,
      );
    }
    seenToolbarIds.add(toolbar.id);

    if (toolbar.items.length === 0) {
      throw new Error(
        `Empty items for ToolbarId: ${String(toolbar.id)}`,
      );
    }
  }

  // --- freeze + preserve order + collect duplicatedItems ---
  const toolbars: ToolbarView[] = [];
  const allItems: CommandId[] = [];
  const occurrence = new Map<CommandId, number>();
  const withinToolbarDupes = new Set<CommandId>();

  for (const toolbar of catalog) {
    const itemIds: CommandId[] = [];
    const seenInToolbar = new Set<CommandId>();

    for (const item of toolbar.items) {
      const commandId = item.commandId;
      itemIds.push(commandId);
      allItems.push(commandId);

      if (seenInToolbar.has(commandId)) {
        withinToolbarDupes.add(commandId);
      }
      seenInToolbar.add(commandId);

      occurrence.set(commandId, (occurrence.get(commandId) ?? 0) + 1);
    }

    toolbars.push(
      Object.freeze({
        id: toolbar.id,
        items: Object.freeze(itemIds),
      }),
    );
  }

  const crossOrTotalDupes = [...occurrence.entries()]
    .filter(([, count]) => count > 1)
    .map(([commandId]) => commandId);

  const duplicatedItems = Object.freeze([
    ...new Set([...withinToolbarDupes, ...crossOrTotalDupes]),
  ]);

  // --- seal ---
  return sealToolbar(
    Object.freeze({
      toolbars: Object.freeze(toolbars),
      items: Object.freeze(allItems),
      duplicatedItems,
    }),
  );
}
