"use client";

/**
 * D58.2 — Floating Windows · presentational ResizeHandle.
 * Chrome only — no geometry math, no GeometryState access.
 * Pointer handlers are supplied by FloatingWindow (bridge-owns-pointer-translation).
 * Authority: D58.0 Discovery · D58.2 Resize Handles · Floating API Freeze intact.
 */

import type { CSSProperties, PointerEvent as ReactPointerEvent } from "react";
import type { WindowResizeEdge } from "./WindowResizeBridge";

/** Presentational handle props — edge identity + pointer wiring only. */
export type FloatingWindowResizeHandleProps = {
  edge: WindowResizeEdge;
  onPointerDown: (event: ReactPointerEvent<HTMLElement>) => void;
  onPointerMove: (event: ReactPointerEvent<HTMLElement>) => void;
  onPointerUp: (event: ReactPointerEvent<HTMLElement>) => void;
};

const HANDLE_SIZE = 8;

const EDGE_STYLE: Record<WindowResizeEdge, CSSProperties> = {
  n: {
    position: "absolute",
    top: 0,
    left: HANDLE_SIZE,
    right: HANDLE_SIZE,
    height: HANDLE_SIZE,
    cursor: "ns-resize",
  },
  s: {
    position: "absolute",
    bottom: 0,
    left: HANDLE_SIZE,
    right: HANDLE_SIZE,
    height: HANDLE_SIZE,
    cursor: "ns-resize",
  },
  e: {
    position: "absolute",
    top: HANDLE_SIZE,
    right: 0,
    bottom: HANDLE_SIZE,
    width: HANDLE_SIZE,
    cursor: "ew-resize",
  },
  w: {
    position: "absolute",
    top: HANDLE_SIZE,
    left: 0,
    bottom: HANDLE_SIZE,
    width: HANDLE_SIZE,
    cursor: "ew-resize",
  },
  ne: {
    position: "absolute",
    top: 0,
    right: 0,
    width: HANDLE_SIZE,
    height: HANDLE_SIZE,
    cursor: "nesw-resize",
  },
  nw: {
    position: "absolute",
    top: 0,
    left: 0,
    width: HANDLE_SIZE,
    height: HANDLE_SIZE,
    cursor: "nwse-resize",
  },
  se: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: HANDLE_SIZE,
    height: HANDLE_SIZE,
    cursor: "nwse-resize",
  },
  sw: {
    position: "absolute",
    bottom: 0,
    left: 0,
    width: HANDLE_SIZE,
    height: HANDLE_SIZE,
    cursor: "nesw-resize",
  },
};

export const FLOATING_WINDOW_RESIZE_EDGES: readonly WindowResizeEdge[] = [
  "n",
  "s",
  "e",
  "w",
  "ne",
  "nw",
  "se",
  "sw",
] as const;

export function FloatingWindowResizeHandle({
  edge,
  onPointerDown,
  onPointerMove,
  onPointerUp,
}: FloatingWindowResizeHandleProps) {
  return (
    <div
      data-floating-window-edge-handle={edge}
      style={EDGE_STYLE[edge]}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    />
  );
}
