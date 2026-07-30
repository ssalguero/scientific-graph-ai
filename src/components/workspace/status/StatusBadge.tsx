/** UX-2.14 — Fixed-height uppercase status badge. */
export type StatusBadgeProps = {
  children: string;
  /** Accessible name (required). */
  "aria-label": string;
  tone?: "muted" | "success" | "warning" | "danger" | "accent";
};

function toneClasses(
  tone: NonNullable<StatusBadgeProps["tone"]>
): string {
  switch (tone) {
    case "success":
      return "border-[var(--app-success)]/35 bg-[var(--app-success-bg)] text-[var(--app-success-text)]";
    case "warning":
      return "border-[var(--app-warning-border)] bg-[var(--app-warning-bg)] text-[var(--app-warning-text)]";
    case "danger":
      return "border-[var(--app-danger-border)] bg-[var(--app-danger-bg)] text-[var(--app-danger-text)]";
    case "accent":
      return "border-[var(--app-accent)]/35 bg-[var(--app-accent)]/10 text-[var(--app-heading)]";
    case "muted":
    default:
      return "border-[var(--app-border)] bg-[var(--app-surface-muted)] text-[var(--app-text-muted)]";
  }
}

/**
 * UX-2.14 — Presentational badge (fixed height, uppercase).
 * Pure UI; no domain knowledge.
 */
export function StatusBadge({
  children,
  "aria-label": ariaLabel,
  tone = "muted",
}: StatusBadgeProps) {
  return (
    <span
      aria-label={ariaLabel}
      className={`inline-flex h-4 shrink-0 items-center rounded border px-1 text-[9px] font-semibold uppercase tracking-wide transition-[opacity,background-color] duration-150 ${toneClasses(tone)}`}
    >
      {children}
    </span>
  );
}
