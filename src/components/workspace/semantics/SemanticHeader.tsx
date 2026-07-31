import type { ReactNode } from "react";

import { DensityProvider } from "../density";
import { Inline, Stack } from "../layout";
import { SEMANTIC_TOKENS } from "./SEMANTIC_TOKENS";

/**
 * UX-2.18b — Presentational panel body header.
 * UX-2.25 — DensityProvider semantic boundary (Fragment; no runtime work).
 * UX-2.26 — Composes Inline + Stack (no raw flex in header tokens).
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
    <DensityProvider>
      <Inline align="center" gap="md">
        {leading != null ? (
          <span className={SEMANTIC_TOKENS.ICON_SIZE}>{leading}</span>
        ) : null}
        <Stack gap="md">
          {title != null ? title : null}
          {subtitle != null ? (
            <span className={SEMANTIC_TOKENS.MUTED_TEXT}>{subtitle}</span>
          ) : null}
        </Stack>
        {trailing != null ? (
          <span className={SEMANTIC_TOKENS.headerTrailing}>{trailing}</span>
        ) : null}
      </Inline>
    </DensityProvider>
  );
}
