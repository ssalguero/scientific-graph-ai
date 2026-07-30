import type { ReactNode } from "react";

import { ACTION_TOKENS } from "./ACTION_TOKENS";

/**
 * UX-2.19 — Presentational action chip.
 * Span only. No interaction. API frozen after UX-2.19.
 */
export type ActionButtonAppearance =
  | "default"
  | "muted"
  | "active"
  | "disabled";

export type ActionButtonProps = {
  icon?: ReactNode;
  children?: ReactNode;
  appearance?: ActionButtonAppearance;
};

export function ActionButton({
  icon,
  children,
  appearance = "default",
}: ActionButtonProps) {
  const className = [
    ACTION_TOKENS.button,
    ACTION_TOKENS.hoverOpacity,
    ACTION_TOKENS.appearances[appearance],
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <span className={className}>
      {icon != null ? (
        <span className={ACTION_TOKENS.iconSize}>{icon}</span>
      ) : null}
      {children}
    </span>
  );
}
