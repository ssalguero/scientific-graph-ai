import type { ReactNode } from "react";

import { LAYOUT_TOKENS } from "./LayoutTokens";

/**
 * UX-2.18 — Presentational empty layout shell.
 * Uses regionPadding + emptyMinHeight only.
 * No icons, EmptyState, copy, or domain.
 */
export type PanelEmptyRegionProps = {
  children: ReactNode;
  className?: string;
};

export function PanelEmptyRegion({
  children,
  className,
}: PanelEmptyRegionProps) {
  const classNameJoined = [
    LAYOUT_TOKENS.regionPadding.none,
    LAYOUT_TOKENS.emptyMinHeight,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return <div className={classNameJoined || undefined}>{children}</div>;
}
