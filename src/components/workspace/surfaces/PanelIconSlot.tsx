import type { ReactNode } from "react";

import { SURFACE_TOKENS } from "./SurfaceTokens";

/** UX-2.16 — Frozen icon slot API (ReactNode only; no glyph enums). */
export type PanelIconSlotProps = {
  icon: ReactNode;
  size?: "sm" | "md";
  tone?: "default" | "explorer" | "inspector" | "console";
};

/**
 * UX-2.16 — Uniform presentational icon slot.
 * Prepared for UX-2.18 iconography without locking glyph enums.
 */
export function PanelIconSlot({
  icon,
  size = "sm",
  tone = "default",
}: PanelIconSlotProps) {
  const className = [
    SURFACE_TOKENS.iconSlot.base,
    SURFACE_TOKENS.iconSlot.size[size],
    SURFACE_TOKENS.tone[tone],
  ].join(" ");

  return (
    <span aria-hidden className={className}>
      {icon}
    </span>
  );
}
