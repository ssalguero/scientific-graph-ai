"use client";

import { getIcon } from "@/lib/ui/icons";
import { sidebarCollapseToggle } from "@/lib/ui/theme";

/** UX-2.5 / UX-2.11 — Panel header: title + optional collapse toggle (generic). */
export type PanelHeaderProps = {
  title: string;
  collapsed?: boolean;
  onToggle?: () => void;
};

/**
 * UX-2.5 — Layout freeze: flex-none.
 * UX-2.11 — Optional toggle; aria-label derived from title only.
 */
export function PanelHeader({
  title,
  collapsed = false,
  onToggle,
}: PanelHeaderProps) {
  const expanded = !collapsed;
  const label = expanded ? `Collapse ${title}` : `Expand ${title}`;

  return (
    <div className="flex flex-none items-center justify-between gap-2 border-b border-[var(--app-border)] px-3 py-2">
      <p className="text-[10px] font-semibold uppercase tracking-[0.09em] text-[var(--app-text-muted)]">
        {title}
      </p>
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
  );
}
