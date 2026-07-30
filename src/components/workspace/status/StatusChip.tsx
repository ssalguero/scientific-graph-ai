import { SURFACE_TOKENS } from "../surfaces/SurfaceTokens";

/** UX-2.14 — Compact presentational chip. */
export type StatusChipProps = {
  children: string;
};

/**
 * UX-2.14 — Small reusable chip (Inspector / Data / Layers / Toolbar later).
 * Pure UI; no domain knowledge.
 * UX-2.21 — Height/type via SURFACE + semantic vocabulary (10px scale).
 */
export function StatusChip({ children }: StatusChipProps) {
  return (
    <span
      className={`inline-flex shrink-0 items-center bg-[var(--app-surface-muted)] transition-[opacity,background-color] duration-150 ${SURFACE_TOKENS.radius.default} ${SURFACE_TOKENS.border.default} ${SURFACE_TOKENS.padding.sm} ${SURFACE_TOKENS.metadata.root}`}
    >
      {children}
    </span>
  );
}
