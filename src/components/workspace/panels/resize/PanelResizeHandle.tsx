"use client";

/**
 * UX-2.9 — Presentational panel splitter (Pointer Capture only).
 * Maps PointerEvent → client number; no layout/panel knowledge beyond axis.
 * No window/document listeners. No mouse globals.
 */

import type { CSSProperties, PointerEvent as ReactPointerEvent } from "react";

import { HANDLE_SIZE } from "./ResizeConstraints";
import type { ResizeAxis } from "./ResizeTypes";
import { usePanelResize } from "./usePanelResize";

export type PanelResizeHandleProps = {
  axis: ResizeAxis;
};

function clientForAxis(
  axis: ResizeAxis,
  event: ReactPointerEvent<HTMLElement>
): number {
  return axis === "bottom" ? event.clientY : event.clientX;
}

/**
 * UX-2.9 — Frozen Pointer Capture lifecycle:
 * pointerdown → setPointerCapture
 * pointermove → updateResize(client)
 * pointerup / pointercancel → endResize + releasePointerCapture
 */
export function PanelResizeHandle({ axis }: PanelResizeHandleProps) {
  const { beginResize, updateResize, endResize } = usePanelResize();

  const isVertical = axis === "bottom";

  const style: CSSProperties = isVertical
    ? {
        height: HANDLE_SIZE,
        width: "100%",
        cursor: "ns-resize",
        touchAction: "none",
        flexShrink: 0,
      }
    : {
        width: HANDLE_SIZE,
        height: "auto",
        alignSelf: "stretch",
        cursor: "ew-resize",
        touchAction: "none",
        flexShrink: 0,
      };

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    beginResize(event.pointerId, axis, clientForAxis(axis, event));
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
    updateResize(clientForAxis(axis, event));
  };

  const finish = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    endResize();
  };

  return (
    <div
      role="separator"
      aria-orientation={isVertical ? "horizontal" : "vertical"}
      data-panel-resize-handle={axis}
      style={style}
      className="bg-transparent transition-colors duration-200 hover:bg-[var(--color-surface-canvas)]"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={finish}
      onPointerCancel={finish}
    />
  );
}
