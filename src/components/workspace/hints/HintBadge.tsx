import { SURFACE_TOKENS } from "../surfaces/SurfaceTokens";

/** UX-2.12 — Presentational tip/info badge. */
export type HintBadgeProps = {
  label: string;
};

/**
 * UX-2.21 — Micro-label recipe via SURFACE_TOKENS.metadata (10px scale).
 */
export function HintBadge({ label }: HintBadgeProps) {
  return (
    <span
      className={`inline-flex shrink-0 items-center bg-[var(--app-surface-muted)] ${SURFACE_TOKENS.radius.default} ${SURFACE_TOKENS.border.default} ${SURFACE_TOKENS.padding.sm} ${SURFACE_TOKENS.metadata.root}`}
    >
      {label}
    </span>
  );
}
