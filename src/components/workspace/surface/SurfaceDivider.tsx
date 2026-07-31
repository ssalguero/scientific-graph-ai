import { SURFACE_TOKENS } from "./SURFACE_TOKENS";

/**
 * UX-2.23 — Official surface-layer divider implementation.
 * No children. API frozen after UX-2.23.
 * Panels must use ContextDivider (adapter); do not import this directly.
 */
export type SurfaceDividerProps = {
  className?: string;
};

export function SurfaceDivider({ className }: SurfaceDividerProps) {
  return (
    <hr
      aria-hidden
      className={
        className ??
        [
          "border-0 border-t border-[var(--app-border)]",
          "my-2.5",
          SURFACE_TOKENS.dividerOpacity,
        ].join(" ")
      }
    />
  );
}
