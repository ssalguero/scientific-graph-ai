import type { ReactNode } from "react";

import { SEMANTIC_TOKENS } from "../../semantics/SEMANTIC_TOKENS";

/** UX-2.12 — Presentational empty-state description. */
export type EmptyDescriptionProps = {
  children: ReactNode;
};

/**
 * UX-2.21 — Muted secondary text via SEMANTIC_TOKENS; max-width kept from
 * existing EmptyState vocabulary (max-w-[16rem] already present).
 */
export function EmptyDescription({ children }: EmptyDescriptionProps) {
  return (
    <p
      className={`max-w-[16rem] text-xs leading-relaxed ${SEMANTIC_TOKENS.MUTED_TEXT}`}
    >
      {children}
    </p>
  );
}
