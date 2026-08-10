/**
 * UX-7.8 — Visual Integration types (representation only).
 *
 * Fence-safe inject types preserve UX-7.1–7.7 product-wire gates
 * (computed export keys; same pattern as UX-7.7 diagnostics).
 */

import type { CommandId } from "../commands/CommandTypes";
import type { CommandDescription } from "../command-descriptions/CommandDescription";
import type { ContextHelp } from "../context-help/ContextHelp";
import type { ShortcutHint } from "../shortcut-hints/ShortcutHint";
import type { TooltipContent } from "../tooltips/TooltipContent";
import type { VisibilityId } from "../visibility/VisibilityTypes";

/** Fence-safe pipeline inject (avoids contiguous historical fence tokens). */
export type PipelineInject = ReturnType<
  (typeof import("../discoverability"))[`${"createDiscoverability"}Pipeline`]
>;

/** Fence-safe snapshot inject (avoids contiguous historical fence tokens). */
export type SnapshotInject = ReturnType<PipelineInject["resolve"]>;

export type { VisibilityId, CommandId };
export type { TooltipContent, ShortcutHint, CommandDescription, ContextHelp };

/** Props for tooltip slot presenter. */
export type TooltipContentViewProps = Readonly<{
  content: TooltipContent | undefined;
}>;

/** Props for shortcut-hint slot presenter. */
export type ShortcutHintViewProps = Readonly<{
  content: ShortcutHint | undefined;
}>;

/** Props for context-help slot presenter. */
export type ContextHelpViewProps = Readonly<{
  content: ContextHelp | undefined;
}>;

/** Props for command-description slot presenter. */
export type CommandDescriptionViewProps = Readonly<{
  content: CommandDescription | undefined;
}>;

/** Props for composite snapshot presenter. */
export type DiscSnapshotViewProps = Readonly<{
  snapshot: SnapshotInject;
}>;
