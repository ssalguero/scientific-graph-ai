"use client";

import type { ReactNode } from "react";

import { getIcon } from "@/lib/ui/icons";
import { sidebarCollapseToggle } from "@/lib/ui/theme";

import { LAYOUT_TOKENS } from "../layout/LayoutTokens";
import { SURFACE_TOKENS } from "../surfaces/SurfaceTokens";

/** UX-2.5 / UX-2.11 / UX-2.12 / UX-2.13 / UX-2.14 / UX-2.15 — Panel header. */
export type PanelHeaderProps = {
  title: string;
  collapsed?: boolean;
  onToggle?: () => void;
  /** UX-2.12 — Presentational slot between title cluster and overflow. */
  actions?: ReactNode;
  /** UX-2.13 — Visual active chrome only (optional). */
  isActive?: boolean;
  /** UX-2.14 — Optional status indicator (e.g. PanelStatus). */
  status?: ReactNode;
  /** UX-2.14 — Optional status badge. */
  badge?: ReactNode;
  /** UX-2.14 — Optional status chips. */
  chips?: ReactNode;
  /** UX-2.15 — Optional overflow affordance (after primary actions). */
  overflow?: ReactNode;
};

/**
 * UX-2.5 — Layout freeze: flex-none.
 * UX-2.11 — Optional toggle; aria-label derived from title only.
 * UX-2.12 — Optional actions slot (no domain knowledge).
 * UX-2.13 — Optional isActive accent bar + header contrast.
 * UX-2.14 — Optional status / badge / chips (presentational).
 * UX-2.15 — Optional overflow after primary actions (frozen order).
 * UX-2.21 — Padding / gap / micro-label via LAYOUT + SURFACE tokens.
 *
 * Slot order (frozen):
 * Title → Status → Badge → Chips → Primary actions → Overflow → Collapse
 */
export function PanelHeader({
  title,
  collapsed = false,
  onToggle,
  actions,
  isActive = false,
  status,
  badge,
  chips,
  overflow,
}: PanelHeaderProps) {
  const expanded = !collapsed;
  const label = expanded ? `Collapse ${title}` : `Expand ${title}`;

  const headerBg = isActive
    ? "bg-[var(--app-surface-muted)]"
    : "bg-transparent";
  const titleColor = isActive
    ? "text-[var(--app-heading)]"
    : "text-[var(--app-text-muted)]";

  return (
    <div
      className={`relative flex flex-none items-center justify-between border-b border-[var(--app-border)] transition-colors duration-150 hover:bg-[var(--app-surface-muted)] ${LAYOUT_TOKENS.headerGap} ${LAYOUT_TOKENS.regionPadding.md} ${headerBg}`}
    >
      {isActive ? (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-0.5 bg-[var(--app-accent)]"
        />
      ) : null}
      <div
        className={`flex min-w-0 items-center ${SURFACE_TOKENS.gap.sm}`}
      >
        {status != null ? status : null}
        <p
          className={`${SURFACE_TOKENS.metadata.root} transition-colors duration-150 ${titleColor}`}
        >
          {title}
        </p>
        {badge != null ? badge : null}
        {chips != null ? (
          <span
            className={`flex min-w-0 flex-wrap items-center ${SURFACE_TOKENS.gap.sm}`}
          >
            {chips}
          </span>
        ) : null}
      </div>
      <div
        className={`flex shrink-0 items-center ${SURFACE_TOKENS.gap.sm}`}
      >
        {actions != null ? actions : null}
        {overflow != null ? overflow : null}
        {onToggle != null ? (
          <button
            type="button"
            data-panel-toggle
            className={`${sidebarCollapseToggle} cursor-pointer`}
            aria-expanded={expanded}
            aria-label={label}
            onClick={onToggle}
          >
            {expanded ? getIcon("collapse") : getIcon("expand")}
          </button>
        ) : null}
      </div>
    </div>
  );
}
