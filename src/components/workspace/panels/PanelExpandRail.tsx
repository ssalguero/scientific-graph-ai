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

/** CRP-6.2.1 — Expand rails stay available but visually quieter vs workspace. */
const positionClass: Record<PanelPosition, string> = {
  left: "max-sm:hidden flex shrink-0 flex-col items-center justify-center border-0 bg-transparent px-0.5 opacity-35 hover:opacity-90 transition-[colors,opacity] duration-[var(--motion-enter-duration)] ease-[var(--motion-enter-easing)] hover:bg-[var(--color-surface-default)]/60",
  right:
    "max-md:hidden flex shrink-0 flex-col items-center justify-center border-0 bg-transparent px-0.5 opacity-35 hover:opacity-90 transition-[colors,opacity] duration-[var(--motion-enter-duration)] ease-[var(--motion-enter-easing)] hover:bg-[var(--color-surface-default)]/60",
  bottom:
    "flex shrink-0 items-center justify-center border-0 bg-transparent py-0.5 opacity-35 hover:opacity-90 transition-[colors,opacity] duration-[var(--motion-enter-duration)] ease-[var(--motion-enter-easing)] hover:bg-[var(--color-surface-default)]/60",
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
    ? "text-[var(--color-text-muted)]"
    : "text-[var(--color-text-muted)]/80";

  return (
    <div
      className={`relative ${positionClass[position]} ${activeClass}`}
      data-panel-expand-host={position}
      data-panel-id={position}
      data-panel-active={isActive ? "true" : "false"}
    >
      <button
        type="button"
        data-panel-expand={position}
        className={`${sidebarCollapseToggle} cursor-pointer`}
        aria-expanded={false}
        aria-label={label}
        title={label}
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
      label="Expandir Explorer — volver a mostrar el panel izquierdo"
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
      label="Expandir Inspector — volver a mostrar el panel derecho"
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
      label="Expandir Consola — volver a mostrar el panel inferior"
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
