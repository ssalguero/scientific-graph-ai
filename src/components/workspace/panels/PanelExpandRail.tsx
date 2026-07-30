"use client";

import { getIcon } from "@/lib/ui/icons";
import { sidebarCollapseToggle } from "@/lib/ui/theme";

import type { PanelPosition } from "./Panel";

/** UX-2.11 — Expand rail props (layout sibling; not inside Panel). */
export type PanelExpandRailProps = {
  position: PanelPosition;
  label: string;
  onExpand: () => void;
};

const positionClass: Record<PanelPosition, string> = {
  left: "max-sm:hidden flex shrink-0 flex-col items-center justify-center border border-[var(--app-border)] bg-[var(--app-surface)] px-0.5",
  right:
    "max-md:hidden flex shrink-0 flex-col items-center justify-center border border-[var(--app-border)] bg-[var(--app-surface)] px-0.5",
  bottom:
    "flex shrink-0 items-center justify-center border border-[var(--app-border)] bg-[var(--app-surface)] py-0.5",
};

/**
 * UX-2.11 — Presentational expand affordance for a collapsed panel.
 * Mounted by WorkspaceBodyLayout only (never inside Panel).
 */
export function PanelExpandRail({
  position,
  label,
  onExpand,
}: PanelExpandRailProps) {
  return (
    <div className={positionClass[position]} data-panel-expand-host={position}>
      <button
        type="button"
        data-panel-expand={position}
        className={sidebarCollapseToggle}
        aria-expanded={false}
        aria-label={label}
        onClick={onExpand}
      >
        {getIcon("expand")}
      </button>
    </div>
  );
}

/** UX-2.11 — Left edge expand rail (Explorer). */
export function LeftExpandRail({ onExpand }: { onExpand: () => void }) {
  return (
    <PanelExpandRail
      position="left"
      label="Expand Explorer"
      onExpand={onExpand}
    />
  );
}

/** UX-2.11 — Right edge expand rail (Inspector). */
export function RightExpandRail({ onExpand }: { onExpand: () => void }) {
  return (
    <PanelExpandRail
      position="right"
      label="Expand Inspector"
      onExpand={onExpand}
    />
  );
}

/** UX-2.11 — Bottom edge expand rail (Console). */
export function BottomExpandRail({ onExpand }: { onExpand: () => void }) {
  return (
    <PanelExpandRail
      position="bottom"
      label="Expand Console"
      onExpand={onExpand}
    />
  );
}

function focusSelector(selector: string) {
  window.setTimeout(() => {
    const el = document.querySelector(selector);
    if (el instanceof HTMLElement) el.focus();
  }, 0);
}

/** UX-2.11 — After collapse, move focus to the matching expand rail. */
export function focusRailAfterCollapse(position: PanelPosition) {
  focusSelector(`[data-panel-expand="${position}"]`);
}

/** UX-2.11 — Expand + move focus to that panel's header toggle. */
export function focusToggleAfterExpand(
  position: PanelPosition,
  expand: () => void
) {
  expand();
  focusSelector(
    `[data-workspace-panel="${position}"] [data-panel-toggle]`
  );
}
