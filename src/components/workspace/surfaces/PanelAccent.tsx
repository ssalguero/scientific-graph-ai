import { SURFACE_TOKENS } from "./SurfaceTokens";

/** UX-2.16 — Frozen decorative accent API. */
export type PanelAccentProps = {
  position?: "left" | "top" | "none";
  tone?: "default" | "explorer" | "inspector" | "console";
};

/**
 * UX-2.16 — Decorative identity bar (CSS only).
 */
export function PanelAccent({
  position = "left",
  tone = "default",
}: PanelAccentProps) {
  if (position === "none") {
    return null;
  }

  const className = [
    SURFACE_TOKENS.accent.base,
    SURFACE_TOKENS.accent.position[position],
    SURFACE_TOKENS.accent.tone[tone],
  ].join(" ");

  return <span aria-hidden className={className} />;
}
