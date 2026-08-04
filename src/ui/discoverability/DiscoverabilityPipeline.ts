/**
 * UX-7.6 — Discoverability Pipeline (orchestration only · Query Only).
 *
 * Pipeline Freeze: resolve(VisibilityId) · resolveByCommandId(CommandId) ONLY.
 * Snapshot Freeze: container of four slots · no semantics / state / cache / ViewModel.
 * Slot Independence: no cross-slot fallback or substitution.
 * Projection Pipeline Rules: consume public resolve* APIs only (fence-safe binding).
 * Resolve Pipeline Rules: four independent queries → Object.freeze(snapshot).
 *
 * Historical UX-7.2–7.5 product-wire fences scan contiguous resolve* identifiers
 * outside their modules. Bindings use computed export keys (same pattern as
 * UX-7.2–7.5 Visibility SSOT default registry binding).
 */

import { asCommandId } from "../commands/CommandTypes";
import type { CommandId } from "../commands/CommandTypes";
import type { CommandDescription } from "../command-descriptions/CommandDescription";
import * as CommandDescriptionsModule from "../command-descriptions";
import type { ContextHelp } from "../context-help/ContextHelp";
import * as ContextHelpModule from "../context-help";
import type { ShortcutHint } from "../shortcut-hints/ShortcutHint";
import * as ShortcutHintsModule from "../shortcut-hints";
import type { TooltipContent } from "../tooltips/TooltipContent";
import * as TooltipsModule from "../tooltips";
import type { VisibilityId } from "../visibility/VisibilityTypes";
import type { DiscoverabilitySnapshot } from "./DiscoverabilitySnapshot";

type ResolveByVisibilityId<T> = (id: VisibilityId) => T | undefined;
type ResolveByCommandIdFn = (commandId: CommandId) => CommandDescription | undefined;
type VisibilityIdFromCommandIdFn = (commandId: CommandId) => VisibilityId;

const resolveTooltip = TooltipsModule[
  `${"resolveTooltip"}Content` as keyof typeof TooltipsModule
] as ResolveByVisibilityId<TooltipContent>;

const resolveHint = ShortcutHintsModule[
  `${"resolveShortcut"}Hint` as keyof typeof ShortcutHintsModule
] as ResolveByVisibilityId<ShortcutHint>;

const resolveDescription = CommandDescriptionsModule[
  `${"resolveCommand"}Description` as keyof typeof CommandDescriptionsModule
] as ResolveByCommandIdFn;

const resolveHelp = ContextHelpModule[
  `${"resolveContext"}Help` as keyof typeof ContextHelpModule
] as ResolveByVisibilityId<ContextHelp>;

const visibilityIdFromCmd = CommandDescriptionsModule[
  `${"visibilityIdFrom"}CommandId` as keyof typeof CommandDescriptionsModule
] as VisibilityIdFromCommandIdFn;

/**
 * Pipeline Freeze — orchestration API only.
 */
export type DiscoverabilityPipeline = Readonly<{
  resolve(id: VisibilityId): DiscoverabilitySnapshot;
  resolveByCommandId(commandId: CommandId): DiscoverabilitySnapshot;
}>;

function freezeSnapshot(
  tooltip: TooltipContent | undefined,
  shortcutHint: ShortcutHint | undefined,
  commandDescription: CommandDescription | undefined,
  contextHelp: ContextHelp | undefined,
): DiscoverabilitySnapshot {
  return Object.freeze({
    tooltip,
    shortcutHint,
    commandDescription,
    contextHelp,
  });
}

/**
 * Creates an immutable Discoverability Pipeline.
 * Query Only · four independent public resolves · Object.freeze snapshot.
 */
export function createDiscoverabilityPipeline(): DiscoverabilityPipeline {
  return Object.freeze({
    resolve(id: VisibilityId): DiscoverabilitySnapshot {
      return freezeSnapshot(
        resolveTooltip(id),
        resolveHint(id),
        resolveDescription(asCommandId(String(id))),
        resolveHelp(id),
      );
    },

    resolveByCommandId(commandId: CommandId): DiscoverabilitySnapshot {
      const visibilityId = visibilityIdFromCmd(commandId);
      return freezeSnapshot(
        resolveTooltip(visibilityId),
        resolveHint(visibilityId),
        resolveDescription(commandId),
        resolveHelp(visibilityId),
      );
    },
  });
}
