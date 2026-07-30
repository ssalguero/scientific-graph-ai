import { CONTENT_TOKENS } from "./CONTENT_TOKENS";

/**
 * UX-2.22 — Content-level divider.
 * Reuses SURFACE divider vocabulary via CONTENT_TOKENS — not Toolbar dividers.
 * API frozen after UX-2.22.
 */
export type DividerContentProps = {
  muted?: boolean;
};

export function DividerContent({ muted = true }: DividerContentProps) {
  const className = [
    CONTENT_TOKENS.divider.base,
    CONTENT_TOKENS.divider.spacing,
    muted ? CONTENT_TOKENS.divider.muted : "",
  ]
    .filter(Boolean)
    .join(" ");

  return <hr aria-hidden className={className} />;
}
