import type { ReactNode } from "react";

import { LAYOUT_TOKENS } from "./LayoutTokens";

/**
 * UX-2.18 — Semantic header region.
 * Vertical flex + header gap; default padding none.
 * Canonical order: first among Header → Toolbar → Content → Footer.
 */
export type PanelHeaderRegionProps = {
  children: ReactNode;
  className?: string;
};

export function PanelHeaderRegion({
  children,
  className,
}: PanelHeaderRegionProps) {
  const classNameJoined = [
    "flex flex-col",
    LAYOUT_TOKENS.headerGap,
    LAYOUT_TOKENS.regionPadding.none,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return <div className={classNameJoined}>{children}</div>;
}
