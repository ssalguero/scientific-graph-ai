import type { ReactNode } from "react";

import { CONTENT_TOKENS } from "./CONTENT_TOKENS";

/**
 * UX-2.22 — Reusable descriptive text.
 * Replaces existing descriptive copy only — no new strings.
 * API frozen after UX-2.22.
 */
export type DescriptionProps = {
  children?: ReactNode;
};

export function Description({ children }: DescriptionProps) {
  return <p className={CONTENT_TOKENS.description}>{children}</p>;
}
