import type { ReactNode } from "react";

import { HintBadge } from "./HintBadge";

/** UX-2.12 — Inline hint (API frozen). No toast / modal / popup. */
export type HintProps = {
  variant?: "tip" | "info";
  children: ReactNode;
};

export function Hint({ variant = "tip", children }: HintProps) {
  const badgeLabel = variant === "info" ? "Info" : "Tip";

  return (
    <p
      role="note"
      className="flex items-start gap-1.5 text-xs text-[var(--app-text-muted)]"
    >
      <HintBadge label={badgeLabel} />
      <span className="min-w-0 leading-relaxed">{children}</span>
    </p>
  );
}
