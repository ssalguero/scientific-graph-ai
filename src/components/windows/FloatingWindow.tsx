"use client";

/**
 * D56.2 — Floating Windows Foundation · FloatingWindow.
 * D57.3 — Title bar Pointer Events → WindowDragBridge.
 * D58.2 — Eight-edge ResizeHandles → WindowResizeBridge.
 * UX-1.1 — Visual chrome only (D48 tokens); props / lifecycle unchanged.
 * Props surface unchanged (FloatingWindowProps). No local geometry state.
 * No useWindowContext / WindowManager imports.
 * Authority: FloatingWindowProps (D56.1 API Freeze) · D58.0 Discovery.
 */

import type { PointerEvent as ReactPointerEvent } from "react";
import { UI_TOKENS } from "@/lib/ui/tokens";
import type { FloatingWindowProps } from "./FloatingWindowTypes";
import { useWindowDrag } from "./WindowDragContext";
import { useWindowResize } from "./WindowResizeContext";
import type { WindowResizeEdge } from "./WindowResizeBridge";
import {
  FLOATING_WINDOW_RESIZE_EDGES,
  FloatingWindowResizeHandle,
} from "./FloatingWindowResizeHandle";

/**
 * Presentational chrome composed from existing D48 primitives only.
 * No new public token keys; geometry remains inline style (API Freeze).
 */
const FLOATING_WINDOW_CHROME = {
  root: [
    "flex h-full flex-col overflow-hidden",
    UI_TOKENS.radius.md,
    UI_TOKENS.border.default,
    "bg-[var(--app-surface)]",
    UI_TOKENS.shadow.md,
  ].join(" "),
  header: [
    "flex h-7 shrink-0 items-center justify-between gap-2 px-2",
    UI_TOKENS.border.bottom,
    "bg-[var(--app-surface-muted)]",
    "cursor-grab active:cursor-grabbing select-none",
  ].join(" "),
  title:
    "min-w-0 truncate text-[11px] font-semibold tracking-tight text-[var(--app-heading)]",
  close: [
    "inline-flex h-5 w-5 shrink-0 items-center justify-center",
    UI_TOKENS.radius.md,
    "text-xs leading-none text-[var(--app-text-muted)]",
    "hover:bg-[var(--app-surface)] hover:text-[var(--app-heading)]",
    UI_TOKENS.transition.colors200,
  ].join(" "),
  body: [
    "min-h-0 flex-1 overflow-auto",
    UI_TOKENS.spacing.p2,
    "bg-[var(--app-surface)] text-xs text-[var(--app-text)]",
  ].join(" "),
} as const;

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
      className={FLOATING_WINDOW_CHROME.root}
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
        className={FLOATING_WINDOW_CHROME.header}
        onPointerDown={onTitlePointerDown}
        onPointerMove={onTitlePointerMove}
        onPointerUp={onTitlePointerUp}
      >
        <span className={FLOATING_WINDOW_CHROME.title}>{model.title}</span>
        <button
          type="button"
          aria-label="Close window"
          className={FLOATING_WINDOW_CHROME.close}
        >
          ×
        </button>
      </header>
      <section className={FLOATING_WINDOW_CHROME.body}>{model.content}</section>
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
