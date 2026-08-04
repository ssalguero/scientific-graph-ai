/**
 * UX-6.6 — Menu Tree Builder.
 *
 * Pipeline: validate → freeze → preserve order → seal.
 * Consumes MENU_CATALOG by default.
 * Build-time only — no dynamic mutation · no React · no execution.
 *
 * Structural hard failures: duplicate MenuId · empty title (throw).
 * Content findings: duplicatedEntries recorded on the sealed tree.
 * Order: exact MENU_CATALOG order (public contract — no sorting).
 */

import type { CommandId } from "../commands/CommandTypes";
import { MENU_CATALOG } from "./MenuCatalog";
import type { MenuDefinition } from "./MenuDefinition";
import {
  sealMenuTree,
  type MenuTree,
  type MenuTreeMenuView,
} from "./MenuTree";
import type { MenuId } from "./MenuTypes";

/**
 * Builds an opaque MenuTree from a catalog.
 * Preserves menu and entry order exactly as declared.
 */
export function buildMenuTree(
  catalog: readonly MenuDefinition[] = MENU_CATALOG,
): MenuTree {
  // --- validate ---
  const seenMenuIds = new Set<MenuId>();
  for (const menu of catalog) {
    if (seenMenuIds.has(menu.id)) {
      throw new Error(`Duplicate MenuId in menu catalog: ${String(menu.id)}`);
    }
    seenMenuIds.add(menu.id);

    if (menu.title.trim().length === 0) {
      throw new Error(`Empty menu title for MenuId: ${String(menu.id)}`);
    }
  }

  // --- freeze + preserve order + collect duplicatedEntries ---
  const menus: MenuTreeMenuView[] = [];
  const allEntries: CommandId[] = [];
  const occurrence = new Map<CommandId, number>();
  const withinMenuDupes = new Set<CommandId>();

  for (const menu of catalog) {
    const entryIds: CommandId[] = [];
    const seenInMenu = new Set<CommandId>();

    for (const entry of menu.entries) {
      const commandId = entry.commandId;
      entryIds.push(commandId);
      allEntries.push(commandId);

      if (seenInMenu.has(commandId)) {
        withinMenuDupes.add(commandId);
      }
      seenInMenu.add(commandId);

      occurrence.set(commandId, (occurrence.get(commandId) ?? 0) + 1);
    }

    menus.push(
      Object.freeze({
        id: menu.id,
        title: menu.title,
        entries: Object.freeze(entryIds),
      }),
    );
  }

  const crossOrTotalDupes = [...occurrence.entries()]
    .filter(([, count]) => count > 1)
    .map(([commandId]) => commandId);

  const duplicatedEntries = Object.freeze([
    ...new Set([...withinMenuDupes, ...crossOrTotalDupes]),
  ]);

  // --- seal ---
  return sealMenuTree(
    Object.freeze({
      menus: Object.freeze(menus),
      entries: Object.freeze(allEntries),
      duplicatedEntries,
    }),
  );
}
