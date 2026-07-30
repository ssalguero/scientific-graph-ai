/** UX-2.12 — Presentational tip/info badge. */
export type HintBadgeProps = {
  label: string;
};

export function HintBadge({ label }: HintBadgeProps) {
  return (
    <span className="inline-flex shrink-0 items-center rounded border border-[var(--app-border)] bg-[var(--app-surface-muted)] px-1 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-[var(--app-text-muted)]">
      {label}
    </span>
  );
}
