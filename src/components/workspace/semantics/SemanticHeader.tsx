import type { ReactNode } from "react";

import { SEMANTIC_TOKENS } from "./SEMANTIC_TOKENS";

/**
 * UX-2.18b — Presentational panel body header.
 * Layout only. API frozen after UX-2.18b.
 */
export type SemanticHeaderProps = {
  title?: ReactNode;
  subtitle?: ReactNode;
  leading?: ReactNode;
  trailing?: ReactNode;
};

export function SemanticHeader({
  title,
  subtitle,
  leading,
  trailing,
}: SemanticHeaderProps) {
  return (
    <div className={SEMANTIC_TOKENS.headerRow}>
      {leading != null ? (
        <span className={SEMANTIC_TOKENS.ICON_SIZE}>{leading}</span>
      ) : null}
      <div className={SEMANTIC_TOKENS.headerTitleCol}>
        {title != null ? title : null}
        {subtitle != null ? (
          <span className={SEMANTIC_TOKENS.MUTED_TEXT}>{subtitle}</span>
        ) : null}
      </div>
      {trailing != null ? (
        <span className={SEMANTIC_TOKENS.headerTrailing}>{trailing}</span>
      ) : null}
    </div>
  );
}
