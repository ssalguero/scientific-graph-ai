import type { ReactNode } from "react";

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
 */
export function PanelStatus({ state, children }: PanelStatusProps) {
  return (
    <span className="inline-flex shrink-0 items-center gap-1">
      <StatusDot state={state} />
      {children != null ? (
        <span className="text-[9px] font-medium uppercase tracking-wide text-[var(--app-text-muted)]">
          {children}
        </span>
      ) : null}
    </span>
  );
}
