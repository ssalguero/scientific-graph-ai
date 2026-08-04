/**
 * UX-6.9 — Consolidated UX diagnostics report type.
 *
 * Pure TypeScript · no React · no Runtime · no side effects.
 * Aggregates the six subsystem reports plus structural metrics.
 */

import type { CommandDiagnosticsReport } from "../commands/CommandDiagnostics";
import type { ShortcutDiagnosticsReport } from "../shortcuts/ShortcutDiagnostics";
import type { CommandPaletteDiagnosticsReport } from "../palette/CommandPaletteDiagnostics";
import type { MenuDiagnosticsReport } from "../menus/MenuDiagnostics";
import type { ToolbarDiagnosticsReport } from "../toolbar/ToolbarDiagnostics";
import type { ContextMenuDiagnosticsReport } from "../context-menus/ContextMenuDiagnostics";
import type { UXMetricsReport } from "./UXMetrics";

/**
 * Frozen consolidated report. Subsystem reports remain owned by their modules.
 */
export type UXDiagnosticsReport = Readonly<{
  commands: CommandDiagnosticsReport;
  shortcuts: ShortcutDiagnosticsReport;
  palette: CommandPaletteDiagnosticsReport;
  menus: MenuDiagnosticsReport;
  toolbar: ToolbarDiagnosticsReport;
  contextMenus: ContextMenuDiagnosticsReport;
  metrics: UXMetricsReport;
}>;
