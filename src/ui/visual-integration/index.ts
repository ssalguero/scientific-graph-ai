/**
 * UX-7.8 — Visual Integration local barrel.
 * Not re-exported from @/ui (src/ui/index.ts) in this phase.
 */

export type {
  PipelineInject,
  SnapshotInject,
  VisibilityId,
  CommandId,
  TooltipContent,
  ShortcutHint,
  CommandDescription,
  ContextHelp,
  TooltipContentViewProps,
  ShortcutHintViewProps,
  ContextHelpViewProps,
  CommandDescriptionViewProps,
  DiscSnapshotViewProps,
} from "./VisualIntegrationTypes";

export {
  queryDiscSnapshot,
  queryDiscSnapshotByCommandId,
} from "./queryDiscSnapshot";

export { TooltipContentView } from "./TooltipContentView";
export { ShortcutHintView } from "./ShortcutHintView";
export { ContextHelpView } from "./ContextHelpView";
export { CommandDescriptionView } from "./CommandDescriptionView";
export { DiscoverabilityView } from "./DiscoverabilityView";
