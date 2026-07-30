import type { ReactNode } from "react";

/** UX-2.12 — Presentational empty-state description. */
export type EmptyDescriptionProps = {
  children: ReactNode;
};

export function EmptyDescription({ children }: EmptyDescriptionProps) {
  return (
    <p className="max-w-[16rem] text-xs leading-relaxed text-[var(--app-text-muted)]">
      {children}
    </p>
  );
}
