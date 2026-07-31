import type { ReactNode } from "react";

import { DensityProvider } from "../density";
import { Inline } from "../layout";
import { SURFACE_TOKENS } from "./SURFACE_TOKENS";

/**
 * UX-2.23 — Surface header chrome (layout only).
 * UX-2.25 — DensityProvider semantic boundary (Fragment; no runtime work).
 * UX-2.26 — Composes Inline for horizontal chrome.
 * Never renders titles — compose SemanticHeader as children.
 * API frozen after UX-2.23.
 */
export type SurfaceHeaderProps = {
  children?: ReactNode;
};

export function SurfaceHeader({ children }: SurfaceHeaderProps) {
  const className = [
    SURFACE_TOKENS.headerHeight,
    SURFACE_TOKENS.compactSpacing,
    SURFACE_TOKENS.bodyGap,
  ].join(" ");

  return (
    <DensityProvider>
      <Inline align="center" gap="none" className={className}>
        {children}
      </Inline>
    </DensityProvider>
  );
}
