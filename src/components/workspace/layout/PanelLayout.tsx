import type { ReactNode } from "react";

import { LAYOUT_TOKENS } from "./LayoutTokens";

/**
 * UX-2.18 — Semantic panel layout shell.
 * Renders children as-is (no ordering / slots / injection).
 *
 * Canonical region order (documented contract — not enforced):
 * Header → Toolbar → Content → Footer
 *
 * API frozen: children + className only.
 * No variants, density, orientation, or direction props.
 * Future distinct layouts require a new semantic component.
 */
export type PanelLayoutProps = {
  children: ReactNode;
  className?: string;
};

export function PanelLayout({ children, className }: PanelLayoutProps) {
  const classNameJoined = ["flex flex-col", LAYOUT_TOKENS.panelGap, className]
    .filter(Boolean)
    .join(" ");

  return <div className={classNameJoined}>{children}</div>;
}
