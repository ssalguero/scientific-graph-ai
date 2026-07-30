import type { ReactNode } from "react";

import { SURFACE_TOKENS } from "../surfaces/SurfaceTokens";

/**
 * UX-2.12 — Hint collection (API frozen).
 * children only — no spacing / orientation / title props.
 * UX-2.21 — Gap via SURFACE_TOKENS.
 */
export type HintGroupProps = {
  children: ReactNode;
};

export function HintGroup({ children }: HintGroupProps) {
  return (
    <div
      className={`flex flex-col ${SURFACE_TOKENS.gap.sm}`}
      data-workspace-hints
    >
      {children}
    </div>
  );
}
