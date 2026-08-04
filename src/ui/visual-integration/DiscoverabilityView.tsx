/**
 * UX-7.8 — Composite Snapshot presenter (representation only).
 *
 * Snapshot Lifetime Freeze: renders one complete Snapshot per invocation.
 * Slot Independence: each slot rendered independently; no cross-fallback.
 * Component Purity Freeze: pure · no state · no cache · no effects.
 */

import type { ReactElement } from "react";
import { CommandDescriptionView } from "./CommandDescriptionView";
import { ContextHelpView } from "./ContextHelpView";
import { ShortcutHintView } from "./ShortcutHintView";
import { TooltipContentView } from "./TooltipContentView";
import type { DiscSnapshotViewProps } from "./VisualIntegrationTypes";

export function DiscoverabilityView(
  props: DiscSnapshotViewProps,
): ReactElement {
  const snapshot = props.snapshot;

  return (
    <span data-disc-view="snapshot">
      <TooltipContentView content={snapshot.tooltip} />
      <ShortcutHintView content={snapshot.shortcutHint} />
      <CommandDescriptionView content={snapshot.commandDescription} />
      <ContextHelpView content={snapshot.contextHelp} />
    </span>
  );
}
