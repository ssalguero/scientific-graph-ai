import type { ReactNode } from "react";

import { SEMANTIC_TOKENS } from "./SEMANTIC_TOKENS";

/**
 * UX-2.18b — Uniform footer shell.
 * Children only. API frozen after UX-2.18b.
 */
export type SemanticFooterProps = {
  children?: ReactNode;
};

export function SemanticFooter({ children }: SemanticFooterProps) {
  return <div className={SEMANTIC_TOKENS.footerRoot}>{children}</div>;
}
