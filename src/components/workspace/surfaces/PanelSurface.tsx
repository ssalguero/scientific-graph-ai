import type { ReactNode } from "react";

import { SURFACE_TOKENS } from "./SurfaceTokens";

/** UX-2.16 — Frozen surface wrapper API (structure only; no tone). */
export type PanelSurfaceProps = {
  children: ReactNode;
  variant?: "default" | "explorer" | "inspector" | "console" | "canvas";
  padding?: "none" | "sm" | "md";
  elevated?: boolean;
  muted?: boolean;
};

/**
 * UX-2.16 — Pure visual surface wrapper.
 * Structure only — identity color belongs to PanelAccent.
 */
export function PanelSurface({
  children,
  variant = "default",
  padding = "none",
  elevated = false,
  muted = false,
}: PanelSurfaceProps) {
  const radius =
    variant === "canvas"
      ? SURFACE_TOKENS.radius.canvas
      : SURFACE_TOKENS.radius.default;

  const className = [
    SURFACE_TOKENS.variant[variant],
    radius,
    SURFACE_TOKENS.padding[padding],
    elevated ? SURFACE_TOKENS.elevated : "",
    muted ? SURFACE_TOKENS.mutedOpacity : "",
  ]
    .filter(Boolean)
    .join(" ");

  return <div className={className}>{children}</div>;
}
