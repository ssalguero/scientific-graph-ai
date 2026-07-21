/**
 * D56.2 — Floating Windows Foundation · presentational FloatingWindow.
 * Render only — no hooks, state, drag, resize, snap, or WindowAPI wiring.
 * Authority: FloatingWindowProps (D56.1 API Freeze).
 */

import type { FloatingWindowProps } from "./FloatingWindowTypes";

export function FloatingWindow({ window: model }: FloatingWindowProps) {
  return (
    <div
      data-floating-window={model.id}
      style={{
        position: "absolute",
        left: model.x,
        top: model.y,
        width: model.width,
        height: model.height,
        zIndex: model.zIndex,
      }}
    >
      <header>
        <span>{model.title}</span>
        <button type="button" aria-label="Close window">
          ×
        </button>
      </header>
      <section>{model.content}</section>
    </div>
  );
}
