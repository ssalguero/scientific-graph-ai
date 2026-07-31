import type { ReactNode } from "react";

import { Inline } from "../layout";
import { SURFACE_TOKENS } from "./SURFACE_TOKENS";

/**
 * UX-2.23 — Surface footer chrome (layout only).
 * UX-2.26 — Composes Inline for horizontal chrome.
 * API frozen after UX-2.23.
 */
export type SurfaceFooterProps = {
  children?: ReactNode;
};

export function SurfaceFooter({ children }: SurfaceFooterProps) {
  const className = [
    SURFACE_TOKENS.footerHeight,
    SURFACE_TOKENS.compactSpacing,
  ].join(" ");

  return (
    <Inline align="center" gap="none" className={className}>
      {children}
    </Inline>
  );
}
