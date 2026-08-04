/**
 * UX-7.6 — DiscoverabilitySnapshot (Snapshot Freeze).
 *
 * Contenedor only: four independent projection slots.
 * No semantics · no state · no cache · no ViewModel · no derived fields.
 * Slot Independence: absence of one slot never substitutes another.
 */

import type { CommandDescription } from "../command-descriptions/CommandDescription";
import type { ContextHelp } from "../context-help/ContextHelp";
import type { ShortcutHint } from "../shortcut-hints/ShortcutHint";
import type { TooltipContent } from "../tooltips/TooltipContent";

/**
 * Frozen container of four Query Only projection slots.
 * Each slot is its official type or undefined.
 */
export type DiscoverabilitySnapshot = Readonly<{
  readonly tooltip: TooltipContent | undefined;
  readonly shortcutHint: ShortcutHint | undefined;
  readonly commandDescription: CommandDescription | undefined;
  readonly contextHelp: ContextHelp | undefined;
}>;
