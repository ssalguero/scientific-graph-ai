import type { ReactNode } from "react";

/**
 * UX-4.7 / UX-4.9 — Presentational Status Bar shell.
 *
 * Layout-only: no hooks, providers, stores, effects, or Runtime.
 * Empty start / center / end zones — product indicators deferred to UX-5.
 * UX-4.9 — chrome styling via Theme Runtime CSS vars (--color-*).
 */

export type StatusBarLayoutProps = {
  children?: ReactNode;
  className?: string;
};

export function StatusBarLayout({ children, className }: StatusBarLayoutProps) {
  const rootClass = [
    "flex h-8 w-full min-w-0 items-center border-t border-[var(--color-border-default)] bg-[var(--color-surface-default)] px-3 text-xs text-[var(--color-text-muted)]",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <footer className={rootClass} aria-label="Status Bar" role="status">
      {children != null ? (
        children
      ) : (
        <>
          <div
            className="flex min-w-0 flex-1 items-center gap-3"
            data-status-zone="start"
          />
          <div
            className="flex min-w-0 flex-1 items-center justify-center gap-3"
            data-status-zone="center"
          />
          <div
            className="flex min-w-0 flex-1 items-center justify-end gap-3"
            data-status-zone="end"
          />
        </>
      )}
    </footer>
  );
}
