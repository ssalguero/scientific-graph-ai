import type { ReactNode } from "react";

import { NAVIGATION_TOKENS } from "./navigationTokens";

/**
 * UX-2.24 — Primary panel page title.
 * Presentational only. API frozen after UX-2.24.
 */
export type PageTitleProps = {
  children?: ReactNode;
};

export function PageTitle({ children }: PageTitleProps) {
  const className = [
    NAVIGATION_TOKENS.fontSize,
    NAVIGATION_TOKENS.fontWeight,
    NAVIGATION_TOKENS.color,
  ].join(" ");

  return <span className={className}>{children}</span>;
}
