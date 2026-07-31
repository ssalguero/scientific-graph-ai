import type { ReactNode } from "react";

import { SURFACE_TOKENS } from "./SURFACE_TOKENS";

/**
 * UX-2.23 — Surface header chrome (layout only).
 * Never renders titles — compose SemanticHeader as children.
 * API frozen after UX-2.23.
 */
export type SurfaceHeaderProps = {
  children?: ReactNode;
};

export function SurfaceHeader({ children }: SurfaceHeaderProps) {
  const className = [
    "flex items-center",
    SURFACE_TOKENS.headerHeight,
    SURFACE_TOKENS.compactSpacing,
    SURFACE_TOKENS.bodyGap,
  ].join(" ");

  return <div className={className}>{children}</div>;
}
