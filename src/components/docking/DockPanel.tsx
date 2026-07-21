"use client";

import { useDockInteraction } from "./useDockInteraction";
import type { DockPanelProps } from "./types";

/**
 * D51.2 / D53.3 — Dock panel host.
 * Keyboard-ready attributes only (tabIndex / aria). No key handlers, styles, or layout.
 * Activation ≠ visibility; does not touch DockState.
 */
export function DockPanel({ id, children }: DockPanelProps) {
  const { focusedDock, activeDock } = useDockInteraction();
  const selected = focusedDock === id;
  const current = activeDock === id;

  return (
    <div
      tabIndex={0}
      aria-selected={selected}
      aria-current={current ? "true" : undefined}
    >
      {children}
    </div>
  );
}
