"use client";

import { getIcon } from "@/lib/ui/icons";
import { sidebarCollapseToggle } from "@/lib/ui/theme";

import type { PanelPosition } from "./Panel";

/** UX-2.11 / UX-2.13 — Expand rail props (layout sibling; not inside Panel). */
export type PanelExpandRailProps = {
  position: PanelPosition;
  label: string;
  onExpand: () => void;
  /** UX-2.13 — Visual active chrome only (optional). */
  isActive?: boolean;
};

const positionClass: Record<PanelPosition, string> = {
  left: "max-sm:hidden flex shrink-0 flex-col items-center justify-center border bg-[var(--color-surface-default)] px-0.5 transition-colors transition-shadow duration-200 hover:bg-[var(--color-surface-canvas)]",
  right:
    "max-md:hidden flex shrink-0 flex-col items-center justify-center border bg-[var(--color-surface-default)] px-0.5 transition-colors transition-shadow duration-200 hover:bg-[var(--color-surface-canvas)]",
  bottom:
    "flex shrink-0 items-center justify-center border bg-[var(--color-surface-default)] py-0.5 transition-colors transition-shadow duration-200 hover:bg-[var(--color-surface-canvas)]",
};

/**
 * UX-2.11 — Presentational expand affordance for a collapsed panel.
 * UX-2.13 — Optional isActive chrome + data-panel-id / data-panel-active.
 * Mounted by WorkspaceBodyLayout only (never inside Panel).
 */
export function PanelExpandRail({
  position,
  label,
  onExpand,
  isActive = false,
}: PanelExpandRailProps) {
  const activeClass = isActive
    ? "border-[var(--color-brand-primary)]/40 shadow-sm"
    : "border-[var(--color-border-default)]";

  return (
    <div
      className={`relative ${positionClass[position]} ${activeClass}`}
      data-panel-expand-host={position}
      data-panel-id={position}
      data-panel-active={isActive ? "true" : "false"}
    >
      {isActive ? (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-0.5 bg-[var(--color-brand-primary)]"
        />
      ) : null}
      <button
        type="button"
        data-panel-expand={position}
        className={`${sidebarCollapseToggle} cursor-pointer`}
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
export function LeftExpandRail({
  onExpand,
  isActive,
}: {
  onExpand: () => void;
  isActive?: boolean;
}) {
  return (
    <PanelExpandRail
      position="left"
      label="Expand Explorer"
      onExpand={onExpand}
      isActive={isActive}
    />
  );
}

/** UX-2.11 — Right edge expand rail (Inspector). */
export function RightExpandRail({
  onExpand,
  isActive,
}: {
  onExpand: () => void;
  isActive?: boolean;
}) {
  return (
    <PanelExpandRail
      position="right"
      label="Expand Inspector"
      onExpand={onExpand}
      isActive={isActive}
    />
  );
}

/** UX-2.11 — Bottom edge expand rail (Console). */
export function BottomExpandRail({
  onExpand,
  isActive,
}: {
  onExpand: () => void;
  isActive?: boolean;
}) {
  return (
    <PanelExpandRail
      position="bottom"
      label="Expand Console"
      onExpand={onExpand}
      isActive={isActive}
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
