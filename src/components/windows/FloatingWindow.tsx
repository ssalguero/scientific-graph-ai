"use client";

/**
 * D56.2 — Floating Windows Foundation · FloatingWindow.
 * D57.3 — Title bar Pointer Events → WindowDragBridge (certified path only).
 * Props surface unchanged (FloatingWindowProps). No local position state.
 * No useWindowContext / WindowManager imports.
 * Authority: FloatingWindowProps (D56.1 API Freeze) · D57.0 Discovery.
 */

import type { PointerEvent as ReactPointerEvent } from "react";
import type { FloatingWindowProps } from "./FloatingWindowTypes";
import { useWindowDrag } from "./WindowDragContext";

export function FloatingWindow({ window: model }: FloatingWindowProps) {
  const { beginDrag, updateDrag, endDrag } = useWindowDrag();

  const onTitlePointerDown = (event: ReactPointerEvent<HTMLElement>) => {
    if ((event.target as HTMLElement).closest("button")) {
      return;
    }
    event.currentTarget.setPointerCapture(event.pointerId);
    beginDrag(model.id, event.clientX, event.clientY);
  };

  const onTitlePointerMove = (event: ReactPointerEvent<HTMLElement>) => {
    if (!event.currentTarget.hasPointerCapture(event.pointerId)) {
      return;
    }
    updateDrag(event.clientX, event.clientY);
  };

  const onTitlePointerUp = (event: ReactPointerEvent<HTMLElement>) => {
    if (!event.currentTarget.hasPointerCapture(event.pointerId)) {
      return;
    }
    endDrag();
    event.currentTarget.releasePointerCapture(event.pointerId);
  };

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
      <header
        data-floating-window-title={model.id}
        onPointerDown={onTitlePointerDown}
        onPointerMove={onTitlePointerMove}
        onPointerUp={onTitlePointerUp}
      >
        <span>{model.title}</span>
        <button type="button" aria-label="Close window">
          ×
        </button>
      </header>
      <section>{model.content}</section>
    </div>
  );
}
