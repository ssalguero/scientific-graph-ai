/**
 * D56.3 — Floating Windows Foundation · presentational FloatingWindowLayer.
 * Renders visible windows only — no hooks, state, or WindowManager imports.
 * Authority: FloatingWindowLayerProps (D56.1 API Freeze).
 */

import { FloatingWindow } from "./FloatingWindow";
import type { FloatingWindowLayerProps } from "./FloatingWindowTypes";

export function FloatingWindowLayer({ windows }: FloatingWindowLayerProps) {
  return (
    <>
      {windows
        .filter((window) => window.visible)
        .map((window) => (
          <FloatingWindow key={window.id} window={window} />
        ))}
    </>
  );
}
