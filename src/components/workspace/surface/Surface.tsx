import type { ReactNode } from "react";

import { DensityProvider } from "../density";
import { Stack } from "../layout";
import { SURFACE_TOKENS } from "./SURFACE_TOKENS";

/**
 * UX-2.23 — Presentation surface wrapper.
 * UX-2.25 — DensityProvider semantic boundary (Fragment; no runtime work).
 * UX-2.26 — Composes Stack for vertical chrome distribution.
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
    "overflow-hidden",
  ].join(" ");

  return (
    <DensityProvider>
      <Stack gap="none" className={className}>
        {children}
      </Stack>
    </DensityProvider>
  );
}
