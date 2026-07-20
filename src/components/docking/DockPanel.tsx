import type { DockPanelProps } from "./types";

/**
 * D51.2 — Dock panel host. Fragment passthrough.
 * `id` reserved for D52+; no DOM wrapper, layout, or styling.
 */
export function DockPanel({ children }: DockPanelProps) {
  return <>{children}</>;
}
