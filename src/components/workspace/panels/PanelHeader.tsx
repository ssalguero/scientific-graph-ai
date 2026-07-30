"use client";

import type { ReactNode } from "react";

import { getIcon } from "@/lib/ui/icons";
import { sidebarCollapseToggle } from "@/lib/ui/theme";

/** UX-2.5 / UX-2.11 / UX-2.12 — Panel header: title + optional actions + collapse toggle. */
export type PanelHeaderProps = {
  title: string;
  collapsed?: boolean;
  onToggle?: () => void;
  /** UX-2.12 — Presentational slot between title and toggle. */
  actions?: ReactNode;
};

/**
 * UX-2.5 — Layout freeze: flex-none.
 * UX-2.11 — Optional toggle; aria-label derived from title only.
 * UX-2.12 — Optional actions slot (no domain knowledge).
 */
export function PanelHeader({
  title,
  collapsed = false,
  onToggle,
  actions,
}: PanelHeaderProps) {
  const expanded = !collapsed;
  const label = expanded ? `Collapse ${title}` : `Expand ${title}`;

  return (
    <div className="flex flex-none items-center justify-between gap-2 border-b border-[var(--app-border)] px-3 py-2">
      <p className="text-[10px] font-semibold uppercase tracking-[0.09em] text-[var(--app-text-muted)]">
        {title}
      </p>
      <div className="flex shrink-0 items-center gap-1.5">
        {actions != null ? actions : null}
        {onToggle != null ? (
          <button
            type="button"
            data-panel-toggle
            className={sidebarCollapseToggle}
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
