import { SURFACE_TOKENS } from "../surfaces/SurfaceTokens";

/** UX-2.17 — Frozen decorative composition divider API. */
export type WorkspaceDividerProps = {
  inset?: "none" | "sm" | "md";
  muted?: boolean;
  className?: string;
};

/**
 * UX-2.17 — Presentational separator.
 * Always a decorative div — never a semantic hr.
 * Uses dividerColor / dividerInset / dividerMuted exclusively.
 */
export function WorkspaceDivider({
  inset = "none",
  muted = false,
  className,
}: WorkspaceDividerProps) {
  const classNameJoined = [
    SURFACE_TOKENS.dividerColor,
    SURFACE_TOKENS.dividerInset[inset],
    muted ? SURFACE_TOKENS.dividerMuted : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return <div aria-hidden className={classNameJoined} />;
}
