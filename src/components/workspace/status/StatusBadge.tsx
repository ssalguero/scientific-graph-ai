import { SURFACE_TOKENS } from "../surfaces/SurfaceTokens";

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
 * UX-2.21 — Radius / type scale via SURFACE_TOKENS.metadata.
 */
export function StatusBadge({
  children,
  "aria-label": ariaLabel,
  tone = "muted",
}: StatusBadgeProps) {
  return (
    <span
      aria-label={ariaLabel}
      className={`inline-flex shrink-0 items-center border text-[10px] font-medium uppercase tracking-[0.08em] transition-[opacity,background-color] duration-150 ${SURFACE_TOKENS.radius.default} ${SURFACE_TOKENS.padding.sm} ${toneClasses(tone)}`}
    >
      {children}
    </span>
  );
}
