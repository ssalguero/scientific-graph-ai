/**
 * UX-6.8 — Context Menu Builder.
 *
 * Pipeline: validate → freeze → preserve order → seal.
 * Consumes CONTEXT_MENU_CATALOG by default.
 * Build-time only — no dynamic mutation · no React · no execution.
 *
 * Structural hard failures: duplicate ContextMenuId · empty catalog · empty items (throw).
 * Content findings: duplicatedItems recorded on the sealed ContextMenus.
 * Order: exact CONTEXT_MENU_CATALOG order (public contract — no sorting).
 */

import type { CommandId } from "../commands/CommandTypes";
import { CONTEXT_MENU_CATALOG } from "./ContextMenuCatalog";
import type { ContextMenuDefinition } from "./ContextMenuDefinition";
import {
  sealContextMenus,
  type ContextMenus,
  type ContextMenuView,
} from "./ContextMenus";
import type { ContextMenuId } from "./ContextMenuTypes";

/**
 * Builds an opaque ContextMenus from a catalog.
 * Preserves context-menu and item order exactly as declared.
 */
export function buildContextMenus(
  catalog: readonly ContextMenuDefinition[] = CONTEXT_MENU_CATALOG,
): ContextMenus {
  // --- validate ---
  if (catalog.length === 0) {
    throw new Error("Context menu catalog must not be empty.");
  }

  const seenContextMenuIds = new Set<ContextMenuId>();
  for (const menu of catalog) {
    if (seenContextMenuIds.has(menu.id)) {
      throw new Error(
        `Duplicate ContextMenuId in context menu catalog: ${String(menu.id)}`,
      );
    }
    seenContextMenuIds.add(menu.id);

    if (menu.items.length === 0) {
      throw new Error(
        `Empty items for ContextMenuId: ${String(menu.id)}`,
      );
    }
  }

  // --- freeze + preserve order + collect duplicatedItems ---
  const contextMenus: ContextMenuView[] = [];
  const allItems: CommandId[] = [];
  const occurrence = new Map<CommandId, number>();
  const withinMenuDupes = new Set<CommandId>();

  for (const menu of catalog) {
    const itemIds: CommandId[] = [];
    const seenInMenu = new Set<CommandId>();

    for (const item of menu.items) {
      const commandId = item.commandId;
      itemIds.push(commandId);
      allItems.push(commandId);

      if (seenInMenu.has(commandId)) {
        withinMenuDupes.add(commandId);
      }
      seenInMenu.add(commandId);

      occurrence.set(commandId, (occurrence.get(commandId) ?? 0) + 1);
    }

    contextMenus.push(
      Object.freeze({
        id: menu.id,
        items: Object.freeze(itemIds),
      }),
    );
  }

  const crossOrTotalDupes = [...occurrence.entries()]
    .filter(([, count]) => count > 1)
    .map(([commandId]) => commandId);

  const duplicatedItems = Object.freeze([
    ...new Set([...withinMenuDupes, ...crossOrTotalDupes]),
  ]);

  // --- seal ---
  return sealContextMenus(
    Object.freeze({
      contextMenus: Object.freeze(contextMenus),
      items: Object.freeze(allItems),
      duplicatedItems,
    }),
  );
}
