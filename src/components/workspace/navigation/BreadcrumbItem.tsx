import type { ReactNode } from "react";

import { NAVIGATION_TOKENS } from "./navigationTokens";

/**
 * UX-2.24 — Single breadcrumb segment.
 * Presentational only. API frozen after UX-2.24.
 */
export type BreadcrumbItemProps = {
  children?: ReactNode;
};

export function BreadcrumbItem({ children }: BreadcrumbItemProps) {
  const className = [
    NAVIGATION_TOKENS.fontSize,
    NAVIGATION_TOKENS.fontWeight,
    NAVIGATION_TOKENS.mutedColor,
  ].join(" ");

  return <span className={className}>{children}</span>;
}
