import { DockProvider } from "./DockContext";
import type { DockRootProps } from "./types";

/**
 * D51.2 — Dock root host. Provider only.
 * Transparent: no DOM wrapper, no layout, no styling.
 */
export function DockRoot({ children }: DockRootProps) {
  return <DockProvider>{children}</DockProvider>;
}
