import type { ReactNode } from "react";

import { Cluster } from "./Cluster";
import { LAYOUT_TOKENS } from "./LayoutTokens";

/**
 * UX-2.18 — Semantic toolbar region.
 * UX-2.26 — Composes Cluster (wrap + row); gap md preserves toolbarGap.
 * align=start preserves prior items-start (not Cluster default center).
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
  const classNameJoined = [LAYOUT_TOKENS.regionPadding.none, className]
    .filter(Boolean)
    .join(" ");

  return (
    <Cluster
      gap="md"
      align="start"
      justify="start"
      wrap="wrap"
      className={classNameJoined || undefined}
    >
      {children}
    </Cluster>
  );
}
