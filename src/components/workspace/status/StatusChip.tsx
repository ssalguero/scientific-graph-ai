/** UX-2.14 — Compact presentational chip. */
export type StatusChipProps = {
  children: string;
};

/**
 * UX-2.14 — Small reusable chip (Inspector / Data / Layers / Toolbar later).
 * Pure UI; no domain knowledge.
 */
export function StatusChip({ children }: StatusChipProps) {
  return (
    <span className="inline-flex h-4 shrink-0 items-center rounded border border-[var(--app-border)] bg-[var(--app-surface-muted)] px-1.5 text-[9px] font-medium text-[var(--app-text-muted)] transition-[opacity,background-color] duration-150">
      {children}
    </span>
  );
}
