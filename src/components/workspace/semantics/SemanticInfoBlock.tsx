import type { ReactNode } from "react";

import { SEMANTIC_TOKENS } from "./SEMANTIC_TOKENS";

/**
 * UX-2.18b — Neutral information container.
 * Children only. API frozen after UX-2.18b.
 */
export type SemanticInfoBlockProps = {
  children?: ReactNode;
};

export function SemanticInfoBlock({ children }: SemanticInfoBlockProps) {
  return <div className={SEMANTIC_TOKENS.infoRoot}>{children}</div>;
}
