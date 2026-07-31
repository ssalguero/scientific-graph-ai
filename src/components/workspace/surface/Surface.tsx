import type { ReactNode } from "react";

import { DensityProvider } from "../density";
import { SURFACE_TOKENS } from "./SURFACE_TOKENS";

/**
 * UX-2.23 — Presentation surface wrapper.
 * UX-2.25 — DensityProvider semantic boundary (Fragment; no runtime work).
 * Background / border / radius / overflow / shadow / flex column only.
 * API frozen after UX-2.23.
 */
export type SurfaceProps = {
  children?: ReactNode;
};

export function Surface({ children }: SurfaceProps) {
  const className = [
    SURFACE_TOKENS.surfaceBackground,
    SURFACE_TOKENS.surfaceBorder,
    SURFACE_TOKENS.panelRadius,
    SURFACE_TOKENS.surfaceShadow,
    "flex flex-col overflow-hidden",
  ].join(" ");

  return (
    <DensityProvider>
      <div className={className}>{children}</div>
    </DensityProvider>
  );
}
