"use client";

import type { ReactNode } from "react";

import { getIcon } from "@/lib/ui/icons";
import { sidebarCollapseToggle } from "@/lib/ui/theme";

/** UX-2.5 / UX-2.11 / UX-2.12 / UX-2.13 — Panel header: title + optional actions + collapse toggle. */
export type PanelHeaderProps = {
  title: string;
  collapsed?: boolean;
  onToggle?: () => void;
  /** UX-2.12 — Presentational slot between title and toggle. */
  actions?: ReactNode;
  /** UX-2.13 — Visual active chrome only (optional). */
  isActive?: boolean;
};

/**
 * UX-2.5 — Layout freeze: flex-none.
 * UX-2.11 — Optional toggle; aria-label derived from title only.
 * UX-2.12 — Optional actions slot (no domain knowledge).
 * UX-2.13 — Optional isActive accent bar + header contrast.
 */
export function PanelHeader({
  title,
  collapsed = false,
  onToggle,
  actions,
  isActive = false,
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
      className={`relative flex flex-none items-center justify-between gap-2 border-b border-[var(--app-border)] px-3 py-2 transition-colors duration-200 hover:bg-[var(--app-surface-muted)] ${headerBg}`}
    >
      {isActive ? (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-0.5 bg-[var(--app-accent)]"
        />
      ) : null}
      <p
        className={`text-[10px] font-semibold uppercase tracking-[0.09em] transition-colors duration-200 ${titleColor}`}
      >
        {title}
      </p>
      <div className="flex shrink-0 items-center gap-1.5">
        {actions != null ? actions : null}
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
