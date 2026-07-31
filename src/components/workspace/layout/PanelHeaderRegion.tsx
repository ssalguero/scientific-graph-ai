import type { ReactNode } from "react";

import { LAYOUT_TOKENS } from "./LayoutTokens";
import { Stack } from "./Stack";

/**
 * UX-2.18 — Semantic header region.
 * UX-2.26 — Composes Stack (vertical) + header gap via STACK_GAPS.md.
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
  const classNameJoined = [LAYOUT_TOKENS.regionPadding.none, className]
    .filter(Boolean)
    .join(" ");

  return (
    <Stack gap="md" className={classNameJoined || undefined}>
      {children}
    </Stack>
  );
}
