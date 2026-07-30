import type { ReactNode } from "react";

import { SURFACE_TOKENS } from "../surfaces/SurfaceTokens";
import type { PanelVisualState } from "./PanelVisualState";
import { StatusDot } from "./StatusDot";

/** UX-2.14 — Presentational status composer (StatusDot + optional children). */
export type PanelStatusProps = {
  state: PanelVisualState;
  children?: ReactNode;
};

/**
 * UX-2.14 — Composes StatusDot with an optional children label slot.
 * No hooks, state, or effects.
 * UX-2.21 — Gap + micro-label via SURFACE_TOKENS.
 */
export function PanelStatus({ state, children }: PanelStatusProps) {
  return (
    <span
      className={`inline-flex shrink-0 items-center ${SURFACE_TOKENS.gap.sm}`}
    >
      <StatusDot state={state} />
      {children != null ? (
        <span className={SURFACE_TOKENS.metadata.root}>{children}</span>
      ) : null}
    </span>
  );
}
