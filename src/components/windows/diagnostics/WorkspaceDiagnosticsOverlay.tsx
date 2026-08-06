"use client";

/**
 * UX-9.8 — Workspace Diagnostics Overlay.
 *
 * Diagnostics Visibility Freeze: off by default.
 * Gate: NEXT_PUBLIC_WORKSPACE_DIAGNOSTICS === "1"
 * Diagnostics Freeze: query-only · never dispatch · mutate · clear · sync · write.
 * Diagnostics Data Freeze: createInteractionDiagnosticsReport + WindowContext.state
 *   + UndoRedo overlay + Clipboard summary only.
 * Diagnostics Readability Freeze: labels · values · grouping only · never JSON.
 * Diagnostics Lifetime Freeze: exists only while DIAGNOSTICS_ENABLED.
 * Provider Composition Freeze: no Provider · Context · Registry.
 * Mounted only from ProductCompositionHost under UndoRedoDomHost.
 */

import { useSyncExternalStore, type ReactNode } from "react";
import { UI_TOKENS } from "@/lib/ui/tokens";
import { useClipboard } from "@/ui/clipboard";
import { useFocus } from "@/ui/focus";
import { useHover } from "@/ui/hover";
import { createInteractionDiagnosticsReport } from "@/ui/interaction-diagnostics";
import { useInteractionCommands } from "@/ui/interaction-commands";
import { useKeyboardNavigation } from "@/ui/keyboard-nav";
import { useSelection } from "@/ui/selection";
import {
  getUndoRedoOverlay,
  subscribeUndoRedoOverlay,
} from "../history";
import { useWindowContext } from "../WindowContext";

const DIAGNOSTICS_ENABLED =
  process.env.NEXT_PUBLIC_WORKSPACE_DIAGNOSTICS === "1";

const OVERLAY_CHROME = {
  root: [
    "pointer-events-none fixed bottom-3 right-3 max-w-xs",
    UI_TOKENS.zIndex.toast,
    UI_TOKENS.radius.md,
    UI_TOKENS.border.default,
    UI_TOKENS.shadow.md,
    "bg-[var(--color-surface-default)]",
    UI_TOKENS.spacing.p2,
    UI_TOKENS.spacing.spaceY15,
    "text-[10px] text-[var(--color-text-primary)]",
    UI_TOKENS.transition.colors200,
  ].join(" "),
  title: [
    "font-semibold uppercase tracking-wide text-[var(--color-text-primary)]",
  ].join(" "),
  group: [UI_TOKENS.spacing.spaceY05].join(" "),
  groupLabel: [
    "font-semibold uppercase tracking-wide text-[var(--color-text-muted)]",
  ].join(" "),
  row: "flex items-baseline justify-between gap-2",
  label: "text-[var(--color-text-muted)]",
  value: "truncate text-[var(--color-text-primary)] font-medium",
} as const;

function displayValue(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === "") {
    return "—";
  }
  return String(value);
}

function DiagnosticsRow({
  label,
  value,
}: Readonly<{ label: string; value: string }>) {
  return (
    <div className={OVERLAY_CHROME.row}>
      <span className={OVERLAY_CHROME.label}>{label}</span>
      <span className={OVERLAY_CHROME.value}>{value}</span>
    </div>
  );
}

function DiagnosticsGroup({
  title,
  children,
}: Readonly<{ title: string; children: ReactNode }>) {
  return (
    <div className={OVERLAY_CHROME.group} data-diagnostics-group={title}>
      <div className={OVERLAY_CHROME.groupLabel}>{title}</div>
      {children}
    </div>
  );
}

/**
 * Active body — hooks run only when DIAGNOSTICS_ENABLED is true.
 */
function WorkspaceDiagnosticsBody() {
  const { state } = useWindowContext();
  const { registry: focusRegistry } = useFocus();
  const { registry: selectionRegistry } = useSelection();
  const { registry: hoverRegistry } = useHover();
  const { registry: keyboardRegistry } = useKeyboardNavigation();
  const { registry: clipboardRegistry } = useClipboard();
  const { dispatcher } = useInteractionCommands();
  const undoRedoOverlay = useSyncExternalStore(
    subscribeUndoRedoOverlay,
    getUndoRedoOverlay,
    getUndoRedoOverlay,
  );

  const report = createInteractionDiagnosticsReport(
    focusRegistry,
    selectionRegistry,
    hoverRegistry,
    keyboardRegistry,
    clipboardRegistry,
    dispatcher,
  );

  const windowCount = state.windows.size;
  const selectedWindows = report.selection.selectedWindowIds.size;
  const selectedContent = report.selection.selectedContentIds.size;
  const clipboardSummary =
    report.clipboard.entry !== null ? "Present" : "Empty";
  const lastCommand = report.interactionCommands.lastResult;
  const lastCommandSummary =
    lastCommand === null
      ? "—"
      : lastCommand.accepted
        ? "Accepted"
        : "Rejected";

  return (
    <aside
      className={OVERLAY_CHROME.root}
      data-workspace-diagnostics="true"
      aria-hidden="true"
    >
      <div className={OVERLAY_CHROME.title}>Workspace Diagnostics</div>

      <DiagnosticsGroup title="Workspace">
        <DiagnosticsRow
          label="Active"
          value={displayValue(state.activeId)}
        />
        <DiagnosticsRow
          label="Focused"
          value={displayValue(state.focusedId)}
        />
        <DiagnosticsRow label="Windows" value={displayValue(windowCount)} />
      </DiagnosticsGroup>

      <DiagnosticsGroup title="Focus">
        <DiagnosticsRow
          label="Target"
          value={displayValue(report.focus.focusedId)}
        />
        <DiagnosticsRow
          label="Last"
          value={displayValue(report.focus.lastFocusedId)}
        />
      </DiagnosticsGroup>

      <DiagnosticsGroup title="Selection">
        <DiagnosticsRow
          label="Windows"
          value={displayValue(selectedWindows)}
        />
        <DiagnosticsRow
          label="Content"
          value={displayValue(selectedContent)}
        />
      </DiagnosticsGroup>

      <DiagnosticsGroup title="Hover">
        <DiagnosticsRow
          label="Window"
          value={displayValue(report.hover.hoveredWindowId)}
        />
        <DiagnosticsRow
          label="Content"
          value={displayValue(report.hover.hoveredContentId)}
        />
      </DiagnosticsGroup>

      <DiagnosticsGroup title="Keyboard">
        <DiagnosticsRow
          label="Direction"
          value={displayValue(report.keyboardNavigation.lastDirection)}
        />
      </DiagnosticsGroup>

      <DiagnosticsGroup title="Clipboard">
        <DiagnosticsRow label="Entry" value={clipboardSummary} />
      </DiagnosticsGroup>

      <DiagnosticsGroup title="Commands">
        <DiagnosticsRow label="Last" value={lastCommandSummary} />
      </DiagnosticsGroup>

      <DiagnosticsGroup title="History">
        <DiagnosticsRow
          label="Undo"
          value={undoRedoOverlay.canUndo ? "Available" : "None"}
        />
        <DiagnosticsRow
          label="Redo"
          value={undoRedoOverlay.canRedo ? "Available" : "None"}
        />
      </DiagnosticsGroup>
    </aside>
  );
}

/**
 * WorkspaceDiagnosticsOverlay — env-gated · query-only · readability labels/values.
 */
export function WorkspaceDiagnosticsOverlay() {
  if (!DIAGNOSTICS_ENABLED) {
    return null;
  }
  return <WorkspaceDiagnosticsBody />;
}
