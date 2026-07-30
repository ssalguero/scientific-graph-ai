import type { ReactNode } from "react";

import { Description } from "../../content";

/** UX-2.12 — Presentational empty-state description. */
export type EmptyDescriptionProps = {
  children: ReactNode;
};

/**
 * UX-2.21 — Muted secondary text via SEMANTIC_TOKENS; max-width kept from
 * existing EmptyState vocabulary (max-w-[16rem] already present).
 * UX-2.22 — Composes workspace/content Description (pixel-identical).
 */
export function EmptyDescription({ children }: EmptyDescriptionProps) {
  return <Description>{children}</Description>;
}
