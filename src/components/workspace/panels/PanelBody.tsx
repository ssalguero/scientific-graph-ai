import type { ReactNode } from "react";

import { LAYOUT_TOKENS } from "../layout/LayoutTokens";

/** UX-2.5 — Panel body: children slot only (empty in this phase). */
export type PanelBodyProps = {
  children?: ReactNode;
};

/**
 * UX-2.5 — Layout freeze: flex-1 min-h-0 overflow-auto.
 * UX-2.21 — Region padding via LAYOUT_TOKENS (nearest existing scale).
 */
export function PanelBody({ children }: PanelBodyProps) {
  return (
    <div
      className={`min-h-0 flex-1 overflow-auto ${LAYOUT_TOKENS.regionPadding.md}`}
    >
      {children}
    </div>
  );
}
