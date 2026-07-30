import type { ReactNode } from "react";

import { UI_TOKENS } from "@/lib/ui/tokens";

/** UX-2.15 — CSS-only height collapse (controlled). */
export type InlineExpanderProps = {
  expanded: boolean;
  children: ReactNode;
  collapsedHeight: number;
};

/**
 * UX-2.15 — CSS class toggles only (gridCollapse*). No JS animation.
 */
export function InlineExpander({
  expanded,
  children,
  collapsedHeight,
}: InlineExpanderProps) {
  return (
    <div
      className={`grid ${UI_TOKENS.transition.all200} ${
        expanded
          ? UI_TOKENS.animation.gridCollapseOpen
          : UI_TOKENS.animation.gridCollapseClosed
      }`}
      style={
        expanded
          ? undefined
          : { maxHeight: collapsedHeight > 0 ? collapsedHeight : undefined }
      }
    >
      <div className="overflow-hidden">{children}</div>
    </div>
  );
}
