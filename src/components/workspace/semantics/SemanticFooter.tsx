import type { ReactNode } from "react";

import { Inline } from "../layout";
import { SEMANTIC_TOKENS } from "./SEMANTIC_TOKENS";

/**
 * UX-2.18b — Uniform footer shell.
 * UX-2.26 — Composes Inline (no raw flex in footerRoot).
 * Children only. API frozen after UX-2.18b.
 */
export type SemanticFooterProps = {
  children?: ReactNode;
};

export function SemanticFooter({ children }: SemanticFooterProps) {
  return (
    <Inline align="center" gap="md" className={SEMANTIC_TOKENS.footerRoot}>
      {children}
    </Inline>
  );
}
