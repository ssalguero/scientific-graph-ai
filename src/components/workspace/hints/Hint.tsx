import type { ReactNode } from "react";

import { SURFACE_TOKENS } from "../surfaces/SurfaceTokens";
import { HintBadge } from "./HintBadge";

/** UX-2.12 — Inline hint (API frozen). No toast / modal / popup. */
export type HintProps = {
  variant?: "tip" | "info";
  children: ReactNode;
};

/**
 * UX-2.21 — Gap + muted text via SURFACE / semantic vocabulary.
 */
export function Hint({ variant = "tip", children }: HintProps) {
  const badgeLabel = variant === "info" ? "Info" : "Tip";

  return (
    <p
      role="note"
      className={`flex items-start text-xs ${SURFACE_TOKENS.gap.sm} ${SURFACE_TOKENS.tone.default}`}
    >
      <HintBadge label={badgeLabel} />
      <span className="min-w-0 leading-relaxed">{children}</span>
    </p>
  );
}
