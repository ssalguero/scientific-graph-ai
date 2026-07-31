import type { ReactNode } from "react";

import { Inline } from "../layout";
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
 * UX-2.26 — Composes Inline (no raw inline-flex).
 */
export function PanelStatus({ state, children }: PanelStatusProps) {
  return (
    <Inline align="center" gap="sm" className="shrink-0">
      <StatusDot state={state} />
      {children != null ? (
        <span className={SURFACE_TOKENS.metadata.root}>{children}</span>
      ) : null}
    </Inline>
  );
}
