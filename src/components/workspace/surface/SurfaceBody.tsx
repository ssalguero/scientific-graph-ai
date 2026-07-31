import type { ReactNode } from "react";

import { Stack } from "../layout";
import { SURFACE_TOKENS } from "./SURFACE_TOKENS";

/**
 * UX-2.23 — Surface body chrome (layout only).
 * UX-2.26 — Composes Stack; grow/overflow remain existing chrome classes.
 * Padding / gap / flex / overflow. API frozen after UX-2.23.
 */
export type SurfaceBodyProps = {
  children?: ReactNode;
};

export function SurfaceBody({ children }: SurfaceBodyProps) {
  const className = [
    "min-h-0 flex-1 overflow-auto",
    SURFACE_TOKENS.normalSpacing,
    SURFACE_TOKENS.bodyGap,
  ].join(" ");

  return (
    <Stack gap="none" className={className}>
      {children}
    </Stack>
  );
}
