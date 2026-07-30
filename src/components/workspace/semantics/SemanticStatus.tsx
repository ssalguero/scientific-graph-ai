import type { ReactNode } from "react";

import { SEMANTIC_TOKENS } from "./SEMANTIC_TOKENS";

/**
 * UX-2.18b — Presentational status row.
 * Children only — no calculations. API frozen after UX-2.18b.
 */
export type SemanticStatusProps = {
  children?: ReactNode;
};

export function SemanticStatus({ children }: SemanticStatusProps) {
  return <div className={SEMANTIC_TOKENS.statusRow}>{children}</div>;
}
