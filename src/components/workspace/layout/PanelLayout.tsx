import type { ReactNode } from "react";

import { DensityProvider } from "../density";
import { LAYOUT_TOKENS } from "./LayoutTokens";
import { Stack } from "./Stack";

/**
 * UX-2.18 — Semantic panel layout shell.
 * UX-2.25 — DensityProvider semantic boundary (Fragment; no runtime work).
 * UX-2.26 — Composes Stack for vertical distribution (semantic layer preserved).
 * Renders children as-is (no ordering / slots / injection).
 *
 * Canonical region order (documented contract — not enforced):
 * Header → Toolbar → Content → Footer
 *
 * API frozen: children + className only.
 * No variants, density, orientation, or direction props.
 * Future distinct layouts require a new semantic component.
 * Stack must never replace PanelLayout at the panel shell level.
 */
export type PanelLayoutProps = {
  children: ReactNode;
  className?: string;
};

export function PanelLayout({ children, className }: PanelLayoutProps) {
  const classNameJoined = [LAYOUT_TOKENS.panelGap, className]
    .filter(Boolean)
    .join(" ");

  return (
    <DensityProvider>
      <Stack gap="none" className={classNameJoined}>
        {children}
      </Stack>
    </DensityProvider>
  );
}
