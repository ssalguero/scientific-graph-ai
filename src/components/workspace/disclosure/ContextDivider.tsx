import { SurfaceDivider } from "../surface";
import { SURFACE_TOKENS } from "../surfaces/SurfaceTokens";

/** UX-2.15 — Hairline separator between primary and contextual content. */
export type ContextDividerProps = {
  className?: string;
};

/**
 * UX-2.15 — Presentational divider only.
 * UX-2.21 — Spacing / color / muted via SURFACE_TOKENS.divider only.
 * UX-2.23 — Adapts to SurfaceDivider (official surface-layer implementation).
 */
export function ContextDivider({ className }: ContextDividerProps) {
  return (
    <SurfaceDivider
      className={
        className ??
        [
          SURFACE_TOKENS.divider.base,
          SURFACE_TOKENS.divider.spacing.md,
          SURFACE_TOKENS.divider.muted,
        ].join(" ")
      }
    />
  );
}
