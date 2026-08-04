/**
 * UX-6.6 — Menu System local barrel.
 * Not re-exported from @/ui (src/ui/index.ts) in this phase.
 */

export type { MenuId } from "./MenuTypes";
export { asMenuId } from "./MenuTypes";

export type {
  MenuDefinition,
  MenuDefinitionInit,
  MenuEntry,
  MenuEntryInit,
} from "./MenuDefinition";
export {
  createMenuDefinition,
  createMenuEntry,
} from "./MenuDefinition";

export { MENU_CATALOG } from "./MenuCatalog";

export type { MenuTree, MenuTreeMenuView } from "./MenuTree";
export {
  getMenuTreeDuplicatedEntries,
  getMenuTreeEntries,
  getMenuTreeMenus,
} from "./MenuTree";

export { buildMenuTree } from "./MenuTreeBuilder";

export type { MenuDiagnosticsReport } from "./MenuDiagnostics";
export { createMenuDiagnosticsReport } from "./MenuDiagnostics";
