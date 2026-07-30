import type { ReactNode } from "react";

import { ACTION_TOKENS } from "./ACTION_TOKENS";

/**
 * UX-2.19 — Presentational toolbar row.
 * Opaque children only — does not know domain widgets, titles, or actions.
 * API frozen after UX-2.19.
 */
export type PanelToolbarProps = {
  children?: ReactNode;
};

export function PanelToolbar({ children }: PanelToolbarProps) {
  return <div className={ACTION_TOKENS.toolbar}>{children}</div>;
}
