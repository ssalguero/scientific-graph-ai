import type { ReactNode } from "react";

import { UI_TOKENS } from "@/lib/ui/tokens";

import { SURFACE_TOKENS } from "../surfaces/SurfaceTokens";
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
 * UX-2.21 — Padding via SURFACE_TOKENS.
 */
export function AdvancedSection({
  children,
  label,
  expanded,
  onToggle,
}: AdvancedSectionProps) {
  const panelId = `advanced-section-${label.replace(/\s+/g, "-").toLowerCase()}`;

  return (
    <div className={SURFACE_TOKENS.padding.sm}>
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
          <div className={SURFACE_TOKENS.padding.sm}>{children}</div>
        </div>
      </div>
    </div>
  );
}
