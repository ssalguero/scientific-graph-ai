import type { ReactNode } from "react";

import { SURFACE_TOKENS } from "./SURFACE_TOKENS";

/**
 * UX-2.23 — Surface body chrome (layout only).
 * Padding / gap / flex / overflow. API frozen after UX-2.23.
 */
export type SurfaceBodyProps = {
  children?: ReactNode;
};

export function SurfaceBody({ children }: SurfaceBodyProps) {
  const className = [
    "flex min-h-0 flex-1 flex-col overflow-auto",
    SURFACE_TOKENS.normalSpacing,
    SURFACE_TOKENS.bodyGap,
  ].join(" ");

  return <div className={className}>{children}</div>;
}
