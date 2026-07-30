import type { ReactNode } from "react";

import { LAYOUT_TOKENS } from "./LayoutTokens";

/**
 * UX-2.18 — Semantic footer region.
 * Vertical flex + footer gap; default padding none.
 * Canonical order: last among Header → Toolbar → Content → Footer.
 */
export type PanelFooterRegionProps = {
  children: ReactNode;
  className?: string;
};

export function PanelFooterRegion({
  children,
  className,
}: PanelFooterRegionProps) {
  const classNameJoined = [
    "flex flex-col",
    LAYOUT_TOKENS.footerGap,
    LAYOUT_TOKENS.regionPadding.none,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return <div className={classNameJoined}>{children}</div>;
}
