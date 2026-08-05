/**
 * UX-8.8 — Interaction Diagnostics Report contract.
 *
 * Report Ordering Freeze · Report Composition Freeze · Report Freeze.
 * Passive composition of existing module snapshots — no enrichment.
 */

import type { FocusState } from "../focus";
import type { SelectionState } from "../selection";
import type { HoverState } from "../hover";
import type { KeyboardNavigationState } from "../keyboard-nav";
import type { ClipboardState } from "../clipboard";
import type { InteractionCommandDispatcherState } from "../interaction-commands";

/**
 * Frozen composition of UX-8.1–UX-8.7 getState() snapshots.
 * Property order is architectural (Report Ordering Freeze).
 */
export type InteractionDiagnosticsReport = Readonly<{
  focus: FocusState;
  selection: SelectionState;
  hover: HoverState;
  keyboardNavigation: KeyboardNavigationState;
  clipboard: ClipboardState;
  interactionCommands: InteractionCommandDispatcherState;
}>;
