import type { ReactNode } from "react";

import { NAVIGATION_TOKENS } from "./navigationTokens";

/**
 * UX-2.24 — Horizontal breadcrumb trail container.
 * Layout only. API frozen after UX-2.24.
 */
export type BreadcrumbsProps = {
  children?: ReactNode;
};

export function Breadcrumbs({ children }: BreadcrumbsProps) {
  const className = [
    NAVIGATION_TOKENS.alignItems,
    NAVIGATION_TOKENS.breadcrumbGap,
  ].join(" ");

  return <nav className={className}>{children}</nav>;
}
