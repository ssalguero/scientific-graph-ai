import { SURFACE_TOKENS } from "./SurfaceTokens";

/** UX-2.16 — Frozen decorative divider API. */
export type PanelDividerProps = {
  spacing?: "sm" | "md";
  muted?: boolean;
};

/**
 * UX-2.16 — Presentational separator.
 * Always a decorative div — never a semantic hr.
 */
export function PanelDivider({
  spacing = "md",
  muted = false,
}: PanelDividerProps) {
  const className = [
    SURFACE_TOKENS.divider.base,
    SURFACE_TOKENS.divider.spacing[spacing],
    muted ? SURFACE_TOKENS.divider.muted : "",
  ]
    .filter(Boolean)
    .join(" ");

  return <div aria-hidden className={className} />;
}
