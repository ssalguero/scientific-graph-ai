import type { ReactNode } from "react";

import { LAYOUT_TOKENS } from "./LayoutTokens";
import { Stack } from "./Stack";

/**
 * UX-2.18 — Semantic footer region.
 * UX-2.26 — Composes Stack (vertical) + footer gap via STACK_GAPS.md.
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
  const classNameJoined = [LAYOUT_TOKENS.regionPadding.none, className]
    .filter(Boolean)
    .join(" ");

  return (
    <Stack gap="md" className={classNameJoined || undefined}>
      {children}
    </Stack>
  );
}
