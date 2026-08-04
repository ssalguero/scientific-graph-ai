/**
 * UX-6.9 — Diagnostics input contract (sole entry shape).
 *
 * Pure TypeScript · no React · no Runtime · no side effects.
 * UXDiagnosticsInput is the unique input for Aggregator, Metrics, and Provider.
 */

import type { CommandDiagnosticsReport } from "../commands/CommandDiagnostics";
import type { ShortcutDiagnosticsReport } from "../shortcuts/ShortcutDiagnostics";
import type { CommandPaletteDiagnosticsReport } from "../palette/CommandPaletteDiagnostics";
import type { MenuDiagnosticsReport } from "../menus/MenuDiagnostics";
import type { ToolbarDiagnosticsReport } from "../toolbar/ToolbarDiagnostics";
import type { ContextMenuDiagnosticsReport } from "../context-menus/ContextMenuDiagnostics";

/**
 * Sole input contract for createUXMetrics, createUXDiagnosticsReport,
 * and UXDiagnosticsProvider. Subsystem reports are owned by their modules.
 */
export type UXDiagnosticsInput = Readonly<{
  commands: CommandDiagnosticsReport;
  shortcuts: ShortcutDiagnosticsReport;
  palette: CommandPaletteDiagnosticsReport;
  menus: MenuDiagnosticsReport;
  toolbar: ToolbarDiagnosticsReport;
  contextMenus: ContextMenuDiagnosticsReport;
}>;
