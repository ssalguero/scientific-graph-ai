import type { ReactNode } from "react";

import { LAYOUT_TOKENS } from "./LayoutTokens";
import { Stack } from "./Stack";

/**
 * UX-2.18 — Semantic content region.
 * UX-2.26 — Composes Stack (vertical) + content gap via STACK_GAPS.md.
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
  const classNameJoined = [LAYOUT_TOKENS.regionPadding.none, className]
    .filter(Boolean)
    .join(" ");

  return (
    <Stack gap="md" className={classNameJoined || undefined}>
      {children}
    </Stack>
  );
}
