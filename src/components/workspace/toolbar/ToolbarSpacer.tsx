import { ACTION_TOKENS } from "./ACTION_TOKENS";

/**
 * UX-2.19 — Flexible toolbar separator.
 * No props. API frozen after UX-2.19.
 */
export function ToolbarSpacer() {
  return <span className={ACTION_TOKENS.spacer} aria-hidden />;
}
