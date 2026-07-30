import type { ReactNode } from "react";

import { ACTION_TOKENS } from "./ACTION_TOKENS";

/**
 * UX-2.19 — Uniform icon wrapper for toolbar actions.
 * Independent from PanelIconSlot. API frozen after UX-2.19.
 */
export type IconSlotProps = {
  children?: ReactNode;
};

export function IconSlot({ children }: IconSlotProps) {
  return (
    <span aria-hidden className={ACTION_TOKENS.iconSlot}>
      {children}
    </span>
  );
}
