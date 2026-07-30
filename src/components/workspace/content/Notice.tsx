import type { ReactNode } from "react";

import { CONTENT_TOKENS } from "./CONTENT_TOKENS";

/**
 * UX-2.22 — Informational content block.
 * Variants compose existing --app-* status tones / SEMANTIC infoRoot.
 * Wire only where an equivalent block already exists.
 * API frozen after UX-2.22.
 */
export type NoticeVariant = "info" | "warning" | "success" | "danger";

export type NoticeProps = {
  variant?: NoticeVariant;
  children?: ReactNode;
};

export function Notice({ variant = "info", children }: NoticeProps) {
  return (
    <div role="note" className={CONTENT_TOKENS.notice[variant]}>
      {children}
    </div>
  );
}
