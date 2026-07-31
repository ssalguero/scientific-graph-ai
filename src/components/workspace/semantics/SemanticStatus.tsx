import type { ReactNode } from "react";

import { Inline } from "../layout";
import { SEMANTIC_TOKENS } from "./SEMANTIC_TOKENS";

/**
 * UX-2.18b — Presentational status row.
 * UX-2.26 — Composes Inline (no raw flex in statusRow).
 * Children only — no calculations. API frozen after UX-2.18b.
 */
export type SemanticStatusProps = {
  children?: ReactNode;
};

export function SemanticStatus({ children }: SemanticStatusProps) {
  return (
    <Inline align="center" gap="none" className={SEMANTIC_TOKENS.statusRow}>
      {children}
    </Inline>
  );
}
