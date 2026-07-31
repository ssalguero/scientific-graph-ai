import type { ReactNode } from "react";

import { SURFACE_TOKENS } from "./SURFACE_TOKENS";

/**
 * UX-2.23 — Surface footer chrome (layout only).
 * API frozen after UX-2.23.
 */
export type SurfaceFooterProps = {
  children?: ReactNode;
};

export function SurfaceFooter({ children }: SurfaceFooterProps) {
  const className = [
    "flex items-center",
    SURFACE_TOKENS.footerHeight,
    SURFACE_TOKENS.compactSpacing,
  ].join(" ");

  return <div className={className}>{children}</div>;
}
