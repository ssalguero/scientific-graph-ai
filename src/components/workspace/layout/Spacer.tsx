import { LAYOUT_TOKENS } from "./LayoutTokens";

/**
 * UX-2.26 — Flex grow helper (flex:1 via tokens).
 * Compose-only. Tokens only. No hooks / Context / app imports.
 */
export type SpacerProps = {
  className?: string;
};

export function Spacer({ className }: SpacerProps) {
  const classNameJoined = [LAYOUT_TOKENS.spacer, className]
    .filter(Boolean)
    .join(" ");

  return <div className={classNameJoined} aria-hidden />;
}
