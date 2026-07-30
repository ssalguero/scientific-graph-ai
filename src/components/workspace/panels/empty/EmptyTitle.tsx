import type { ReactNode } from "react";

/** UX-2.12 — Presentational empty-state title. */
export type EmptyTitleProps = {
  children: ReactNode;
};

/**
 * UX-2.21 — Title weight via existing heading var; size stays text-sm
 * (already in EmptyState vocabulary; not a new scale).
 */
export function EmptyTitle({ children }: EmptyTitleProps) {
  return (
    <p className="text-sm font-medium text-[var(--app-heading)]">{children}</p>
  );
}
