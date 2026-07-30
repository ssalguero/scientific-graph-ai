"use client";

import { useId, useState, type ReactNode } from "react";

import { UI_TOKENS } from "@/lib/ui/tokens";

/**
 * UX-2.15 — Uncontrolled disclosure block.
 * Owns local UI state (useState) initialized from defaultExpanded.
 * Never syncs back to props, panel layout state, workspace providers, or persistence.
 * Not semi-controlled: no controlled expand API on this component.
 */
export type DisclosureSectionProps = {
  title: string;
  defaultExpanded?: boolean;
  children?: ReactNode;
};

export function DisclosureSection({
  title,
  defaultExpanded = true,
  children,
}: DisclosureSectionProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const panelId = useId();

  return (
    <div className="py-1">
      <button
        type="button"
        className="flex w-full cursor-pointer items-center gap-1.5 rounded px-0.5 py-0.5 text-left transition-colors duration-150 hover:bg-[var(--app-surface-muted)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--app-accent)]/30"
        aria-expanded={expanded}
        aria-controls={panelId}
        aria-label={expanded ? `Collapse ${title}` : `Expand ${title}`}
        onClick={() => setExpanded((current) => !current)}
      >
        <span
          aria-hidden
          className="text-[9px] text-[var(--app-text-muted)]"
        >
          {expanded ? "▾" : "▸"}
        </span>
        <span className="text-[10px] font-semibold uppercase tracking-[0.09em] text-[var(--app-text-muted)]">
          {title}
        </span>
      </button>
      <div
        id={panelId}
        role="region"
        aria-label={title}
        className={`grid ${UI_TOKENS.transition.all200} ${
          expanded
            ? UI_TOKENS.animation.gridCollapseOpen
            : UI_TOKENS.animation.gridCollapseClosed
        }`}
      >
        <div className="overflow-hidden">
          <div className="pt-1">{children}</div>
        </div>
      </div>
    </div>
  );
}
