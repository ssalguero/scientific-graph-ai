"use client";

import { useId, useState, type ReactNode } from "react";

import { DS_FOCUS_RING, DS_MOTION_ENTER } from "@/lib/ui/focus-ring";
import { UI_TOKENS } from "@/lib/ui/tokens";

import { SURFACE_TOKENS } from "../surfaces/SurfaceTokens";

/**
 * UX-2.15 — Uncontrolled disclosure block.
 * Owns local UI state (useState) initialized from defaultExpanded.
 * Never syncs back to props, panel layout state, workspace providers, or persistence.
 * Not semi-controlled: no controlled expand API on this component.
 * UX-I5 — Certified focus ring + motion + typography.
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
    <div className={SURFACE_TOKENS.padding.sm}>
      <button
        type="button"
        className={`flex w-full cursor-pointer items-center rounded-[var(--radius-container)] text-left ${DS_MOTION_ENTER} hover:bg-[var(--color-surface-canvas)] ${DS_FOCUS_RING} ${SURFACE_TOKENS.gap.sm} ${SURFACE_TOKENS.padding.sm}`}
        aria-expanded={expanded}
        aria-controls={panelId}
        aria-label={expanded ? `Collapse ${title}` : `Expand ${title}`}
        onClick={() => setExpanded((current) => !current)}
      >
        <span
          aria-hidden
          className={`text-[length:var(--typography-caption-xs-font-size)] ${SURFACE_TOKENS.tone.default}`}
        >
          {expanded ? "▾" : "▸"}
        </span>
        <span className={SURFACE_TOKENS.metadata.root}>{title}</span>
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
          <div className={SURFACE_TOKENS.padding.sm}>{children}</div>
        </div>
      </div>
    </div>
  );
}
