import type { DockZoneProps } from "./types";

/**
 * D51.2 — Dock zone host. Fragment passthrough.
 * `side` reserved for D52+; no DOM wrapper, layout, or styling.
 */
export function DockZone({ children }: DockZoneProps) {
  return <>{children}</>;
}
