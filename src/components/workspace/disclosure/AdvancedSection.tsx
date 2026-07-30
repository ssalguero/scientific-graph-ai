import type { ReactNode } from "react";

import { UI_TOKENS } from "@/lib/ui/tokens";

import { RevealButton } from "./RevealButton";

/** UX-2.15 — Fully controlled advanced disclosure block. */
export type AdvancedSectionProps = {
  children?: ReactNode;
  label: string;
  expanded: boolean;
  onToggle: () => void;
};

/**
 * UX-2.15 — Controlled “Advanced ▼” chrome. No internal state.
 */
export function AdvancedSection({
  children,
  label,
  expanded,
  onToggle,
}: AdvancedSectionProps) {
  const panelId = `advanced-section-${label.replace(/\s+/g, "-").toLowerCase()}`;

  return (
    <div className="py-1">
      <RevealButton
        expanded={expanded}
        onToggle={onToggle}
        label={label}
        controlsId={panelId}
      />
      <div
        id={panelId}
        role="region"
        aria-label={label}
        className={`grid ${UI_TOKENS.transition.all200} ${
          expanded
            ? UI_TOKENS.animation.gridCollapseOpen
            : UI_TOKENS.animation.gridCollapseClosed
        }`}
      >
        <div className="overflow-hidden">
          <div className="pt-1.5">{children}</div>
        </div>
      </div>
    </div>
  );
}
