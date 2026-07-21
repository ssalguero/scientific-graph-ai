"use client";

/**
 * D56.3 — Floating Windows Foundation · FloatingWindowBridge.
 * Sole consumer of useWindowContext in the floating surface.
 * D56 official behavior: empty windows collection (Zero UX).
 * Authority: D56 presentational + bridge architecture.
 */

import { useWindowContext } from "./WindowContext";
import { FloatingWindowLayer } from "./FloatingWindowLayer";

export function FloatingWindowBridge() {
  useWindowContext();
  return <FloatingWindowLayer windows={[]} />;
}
