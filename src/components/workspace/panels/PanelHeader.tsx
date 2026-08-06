"use client";

import type { ReactNode } from "react";

import { getIcon } from "@/lib/ui/icons";
import { sidebarCollapseToggle } from "@/lib/ui/theme";

import { Cluster, Inline } from "../layout";
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
 * UX-2.26 — Composes Inline / Cluster (no raw flex).
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
    ? "bg-[var(--color-surface-canvas)]"
    : "bg-transparent";
  const titleColor = isActive
    ? "text-[var(--color-text-primary)]"
    : "text-[var(--color-text-muted)]";

  return (
    <Inline
      align="center"
      justify="between"
      gap="none"
      className={`relative flex-none border-b border-[var(--color-border-default)] transition-colors duration-150 hover:bg-[var(--color-surface-canvas)] ${LAYOUT_TOKENS.headerGap} ${LAYOUT_TOKENS.regionPadding.md} ${headerBg}`}
    >
      {isActive ? (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-0.5 bg-[var(--color-brand-primary)]"
        />
      ) : null}
      <Inline align="center" gap="sm" className="min-w-0">
        {status != null ? status : null}
        <p
          className={`${SURFACE_TOKENS.metadata.root} transition-colors duration-150 ${titleColor}`}
        >
          {title}
        </p>
        {badge != null ? badge : null}
        {chips != null ? (
          <Cluster gap="sm" align="center" className="min-w-0">
            {chips}
          </Cluster>
        ) : null}
      </Inline>
      <Inline align="center" gap="sm" className="shrink-0">
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
      </Inline>
    </Inline>
  );
}
