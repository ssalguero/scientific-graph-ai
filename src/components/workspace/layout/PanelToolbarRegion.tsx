import type { ReactNode } from "react";

import { LAYOUT_TOKENS } from "./LayoutTokens";

/**
 * UX-2.18 — Semantic toolbar region.
 * Horizontal flex + wrap + toolbar gap; default padding none.
 * No commands, actions, or behavior.
 * Canonical order: second among Header → Toolbar → Content → Footer.
 */
export type PanelToolbarRegionProps = {
  children: ReactNode;
  className?: string;
};

export function PanelToolbarRegion({
  children,
  className,
}: PanelToolbarRegionProps) {
  const classNameJoined = [
    "flex flex-row flex-wrap items-start",
    LAYOUT_TOKENS.toolbarGap,
    LAYOUT_TOKENS.regionPadding.none,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return <div className={classNameJoined}>{children}</div>;
}
