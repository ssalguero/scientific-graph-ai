/**
 * UX-8.8 — Interaction Diagnostics factory (query-only · pure composition).
 *
 * Query-only Freeze: getState() only.
 * Report Composition Freeze: each section = dependency.getState().
 * Report Freeze: Object.freeze(report).
 * Snapshot Freeze / Snapshot Identity Freeze: new frozen snapshot per call.
 * Stateless Diagnostics Freeze: no private state / cache / memo / history.
 * Registry Independence Freeze: never coordinate / sync / correct registries.
 * Failure Transparency Freeze: exceptions from getState() propagate.
 */

import type { FocusRegistryApi } from "../focus";
import type { SelectionRegistryApi } from "../selection";
import type { HoverRegistryApi } from "../hover";
import type { KeyboardNavigationRegistryApi } from "../keyboard-nav";
import type { ClipboardRegistryApi } from "../clipboard";
import type { InteractionCommandDispatcherApi } from "../interaction-commands";
import type { InteractionDiagnosticsReport } from "./InteractionDiagnosticsReport";

/**
 * Builds an immutable Interaction Diagnostics report.
 * Pure function — Query Only · no class · no mutation · no side effects.
 */
export function createInteractionDiagnosticsReport(
  focusRegistry: FocusRegistryApi,
  selectionRegistry: SelectionRegistryApi,
  hoverRegistry: HoverRegistryApi,
  keyboardNavigationRegistry: KeyboardNavigationRegistryApi,
  clipboardRegistry: ClipboardRegistryApi,
  interactionCommandDispatcher: InteractionCommandDispatcherApi,
): InteractionDiagnosticsReport {
  const report: InteractionDiagnosticsReport = {
    focus: focusRegistry.getState(),
    selection: selectionRegistry.getState(),
    hover: hoverRegistry.getState(),
    keyboardNavigation: keyboardNavigationRegistry.getState(),
    clipboard: clipboardRegistry.getState(),
    interactionCommands: interactionCommandDispatcher.getState(),
  };

  return Object.freeze(report);
}
