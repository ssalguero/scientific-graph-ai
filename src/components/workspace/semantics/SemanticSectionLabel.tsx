import type { ReactNode } from "react";

import { SEMANTIC_TOKENS } from "./SEMANTIC_TOKENS";

/**
 * UX-2.18b — Micro identity label (not an h2).
 * API frozen after UX-2.18b.
 */
export type SemanticSectionLabelProps = {
  children?: ReactNode;
  label?: ReactNode;
};

export function SemanticSectionLabel({
  children,
  label,
}: SemanticSectionLabelProps) {
  const content = children ?? label;
  return <div className={SEMANTIC_TOKENS.label}>{content}</div>;
}
