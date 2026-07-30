import type { ReactNode } from "react";

import { ACTION_TOKENS } from "./ACTION_TOKENS";

/**
 * UX-2.19 — Presentational action cluster.
 * Spacing only. API frozen after UX-2.19.
 */
export type ActionGroupProps = {
  children?: ReactNode;
};

export function ActionGroup({ children }: ActionGroupProps) {
  return <div className={ACTION_TOKENS.group}>{children}</div>;
}
