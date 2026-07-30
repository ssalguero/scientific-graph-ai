import type { ReactNode } from "react";

/** UX-2.12 — Presentational empty-state icon wrapper. */
export type EmptyIconProps = {
  children: ReactNode;
};

export function EmptyIcon({ children }: EmptyIconProps) {
  return (
    <div
      className="flex h-8 w-8 items-center justify-center text-base text-[var(--app-text-muted)]"
      aria-hidden="true"
    >
      {children}
    </div>
  );
}
