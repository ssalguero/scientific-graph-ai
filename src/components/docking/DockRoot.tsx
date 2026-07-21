import { DockProvider } from "./DockContext";
import { DockInteractionProvider } from "./DockInteractionProvider";
import type { DockRootProps } from "./types";

/**
 * D51.2 / D53.2 — Dock root host.
 * Nesting (one-way): DockProvider → DockInteractionProvider → children.
 * Transparent: no DOM wrapper, no layout, no styling.
 */
export function DockRoot({ children }: DockRootProps) {
  return (
    <DockProvider>
      <DockInteractionProvider>{children}</DockInteractionProvider>
    </DockProvider>
  );
}
