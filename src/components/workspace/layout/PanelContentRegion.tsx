import type { ReactNode } from "react";

import { LAYOUT_TOKENS } from "./LayoutTokens";

/**
 * UX-2.18 — Semantic content region.
 * Vertical flex + content gap; default padding none.
 * Pure layout shell — no grow, clipping, or position pinning classes.
 * Canonical order: third among Header → Toolbar → Content → Footer.
 */
export type PanelContentRegionProps = {
  children: ReactNode;
  className?: string;
};

export function PanelContentRegion({
  children,
  className,
}: PanelContentRegionProps) {
  const classNameJoined = [
    "flex flex-col",
    LAYOUT_TOKENS.contentGap,
    LAYOUT_TOKENS.regionPadding.none,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return <div className={classNameJoined}>{children}</div>;
}
