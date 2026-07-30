import type { ReactNode } from "react";

/** UX-2.12 — Presentational empty-state title. */
export type EmptyTitleProps = {
  children: ReactNode;
};

export function EmptyTitle({ children }: EmptyTitleProps) {
  return (
    <p className="text-sm font-medium text-[var(--app-heading)]">{children}</p>
  );
}
