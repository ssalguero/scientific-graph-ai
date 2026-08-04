/**
 * UX-6.8 — Context Menu System local barrel.
 * Not re-exported from @/ui (src/ui/index.ts) in this phase.
 *
 * Opaque read helpers (getContextMenus*) are intentionally NOT exported —
 * only ContextMenuDiagnostics may inspect sealed storage.
 */

export type { ContextMenuId } from "./ContextMenuTypes";
export { asContextMenuId } from "./ContextMenuTypes";

export type {
  ContextMenuDefinition,
  ContextMenuDefinitionInit,
  ContextMenuItem,
  ContextMenuItemInit,
} from "./ContextMenuDefinition";
export {
  createContextMenuDefinition,
  createContextMenuItem,
} from "./ContextMenuDefinition";

export { CONTEXT_MENU_CATALOG } from "./ContextMenuCatalog";

export type { ContextMenus } from "./ContextMenus";

export { buildContextMenus } from "./ContextMenuBuilder";

export type { ContextMenuDiagnosticsReport } from "./ContextMenuDiagnostics";
export { createContextMenuDiagnosticsReport } from "./ContextMenuDiagnostics";
