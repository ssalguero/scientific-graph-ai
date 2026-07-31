import type { ReactNode } from "react";

import { Inline } from "../layout";
import { NAVIGATION_TOKENS } from "./navigationTokens";

/**
 * UX-2.24 — Horizontal breadcrumb trail container.
 * UX-2.26 — Composes Inline inside nav (a11y landmark preserved).
 * Layout only. API frozen after UX-2.24.
 */
export type BreadcrumbsProps = {
  children?: ReactNode;
};

export function Breadcrumbs({ children }: BreadcrumbsProps) {
  return (
    <nav>
      <Inline align="center" gap="none" className={NAVIGATION_TOKENS.breadcrumbGap}>
        {children}
      </Inline>
    </nav>
  );
}
