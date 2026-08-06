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
      return "border-[var(--color-feedback-success)]/35 bg-[color-mix(in srgb, var(--color-feedback-success) 16%, var(--color-surface-default))] text-[var(--color-feedback-success)]";
    case "warning":
      return "border-[color-mix(in srgb, var(--color-feedback-warning) 35%, var(--color-border-default))] bg-[color-mix(in srgb, var(--color-feedback-warning) 16%, var(--color-surface-default))] text-[var(--color-feedback-warning)]";
    case "danger":
      return "border-[color-mix(in srgb, var(--color-feedback-danger) 35%, var(--color-border-default))] bg-[color-mix(in srgb, var(--color-feedback-danger) 14%, var(--color-surface-default))] text-[var(--color-feedback-danger)]";
    case "accent":
      return "border-[var(--color-brand-primary)]/35 bg-[var(--color-brand-primary)]/10 text-[var(--color-text-primary)]";
    case "muted":
    default:
      return "border-[var(--color-border-default)] bg-[var(--color-surface-canvas)] text-[var(--color-text-muted)]";
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
