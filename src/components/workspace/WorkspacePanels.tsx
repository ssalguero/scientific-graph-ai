import { Children } from "react";
import { FloatingWindowBridge } from "@/components/windows";
import type { WorkspacePanelsProps } from "./types";

/**
 * D47.2 — Thin overlay host.
 * D56.4 — FloatingWindowBridge between Dock and Toasts (Zero UX: empty windows).
 *
 * Composition today (page-owned children):
 * - Slot 0: Dock tree (DockRoot → … → Inspector chrome may mount here)
 * - FloatingWindowBridge (always)
 * - Remaining siblings: toasts / ephemeral overlays
 *
 * Move-only infrastructure: no state, hooks, or domain logic.
 */
export function WorkspacePanels({ children }: WorkspacePanelsProps) {
  const items = Children.toArray(children);
  const dock = items[0];
  const rest = items.slice(1);

  return (
    <>
      {dock}
      <FloatingWindowBridge />
      {rest}
    </>
  );
}
