import type { ReactNode } from "react";

import { ICON_TOKENS } from "../../iconography/ICON_TOKENS";
import { SURFACE_TOKENS } from "../../surfaces/SurfaceTokens";

/** UX-2.12 — Presentational empty-state icon wrapper. */
export type EmptyIconProps = {
  children: ReactNode;
};

/**
 * UX-2.21 — Icon box aligns to SURFACE iconSlot.md + ICON color inheritance.
 */
export function EmptyIcon({ children }: EmptyIconProps) {
  return (
    <div
      className={`flex items-center justify-center ${SURFACE_TOKENS.iconSlot.base} ${SURFACE_TOKENS.iconSlot.size.md} ${ICON_TOKENS.color}`}
      aria-hidden="true"
    >
      {children}
    </div>
  );
}
