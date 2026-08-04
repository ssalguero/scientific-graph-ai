/**
 * UX-6.7 — Toolbar System local barrel.
 * Not re-exported from @/ui (src/ui/index.ts) in this phase.
 *
 * Opaque read helpers (getToolbar*) are intentionally NOT exported —
 * only ToolbarDiagnostics may inspect sealed storage.
 */

export type { ToolbarId } from "./ToolbarTypes";
export { asToolbarId } from "./ToolbarTypes";

export type {
  ToolbarDefinition,
  ToolbarDefinitionInit,
  ToolbarItem,
  ToolbarItemInit,
} from "./ToolbarDefinition";
export {
  createToolbarDefinition,
  createToolbarItem,
} from "./ToolbarDefinition";

export { TOOLBAR_CATALOG } from "./ToolbarCatalog";

export type { Toolbar } from "./Toolbar";

export { buildToolbar } from "./ToolbarBuilder";

export type { ToolbarDiagnosticsReport } from "./ToolbarDiagnostics";
export { createToolbarDiagnosticsReport } from "./ToolbarDiagnostics";
