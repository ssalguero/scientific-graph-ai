"use client";

/**
 * D56.2 — Floating Windows Foundation · FloatingWindow.
 * D57.3 — Title bar Pointer Events → WindowDragBridge.
 * D58.2 — Eight-edge ResizeHandles → WindowResizeBridge.
 * Props surface unchanged (FloatingWindowProps). No local geometry state.
 * No useWindowContext / WindowManager imports.
 * Authority: FloatingWindowProps (D56.1 API Freeze) · D58.0 Discovery.
 */

import type { PointerEvent as ReactPointerEvent } from "react";
import type { FloatingWindowProps } from "./FloatingWindowTypes";
import { useWindowDrag } from "./WindowDragContext";
import { useWindowResize } from "./WindowResizeContext";
import type { WindowResizeEdge } from "./WindowResizeBridge";
import {
  FLOATING_WINDOW_RESIZE_EDGES,
  FloatingWindowResizeHandle,
} from "./FloatingWindowResizeHandle";

export function FloatingWindow({ window: model }: FloatingWindowProps) {
  const { beginDrag, updateDrag, endDrag } = useWindowDrag();
  const { beginResize, updateResize, endResize } = useWindowResize();

  const onTitlePointerDown = (event: ReactPointerEvent<HTMLElement>) => {
    if ((event.target as HTMLElement).closest("button")) {
      return;
    }
    if (
      (event.target as HTMLElement).closest("[data-floating-window-edge-handle]")
    ) {
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

  const onHandlePointerDown =
    (edge: WindowResizeEdge) => (event: ReactPointerEvent<HTMLElement>) => {
      event.stopPropagation();
      event.currentTarget.setPointerCapture(event.pointerId);
      beginResize(model.id, edge, event.clientX, event.clientY);
    };

  const onHandlePointerMove = (event: ReactPointerEvent<HTMLElement>) => {
    if (!event.currentTarget.hasPointerCapture(event.pointerId)) {
      return;
    }
    updateResize(event.clientX, event.clientY);
  };

  const onHandlePointerUp = (event: ReactPointerEvent<HTMLElement>) => {
    if (!event.currentTarget.hasPointerCapture(event.pointerId)) {
      return;
    }
    endResize();
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
      {FLOATING_WINDOW_RESIZE_EDGES.map((edge) => (
        <FloatingWindowResizeHandle
          key={edge}
          edge={edge}
          onPointerDown={onHandlePointerDown(edge)}
          onPointerMove={onHandlePointerMove}
          onPointerUp={onHandlePointerUp}
        />
      ))}
    </div>
  );
}
