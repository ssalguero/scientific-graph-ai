"use client";

/**
 * D56.2 — Floating Windows Foundation · FloatingWindow.
 * D57.3 — Title bar Pointer Events → WindowDragBridge.
 * D58.2 — Eight-edge ResizeHandles → WindowResizeBridge.
 * UX-1.1 — Visual chrome only (D48 tokens); props / lifecycle unchanged.
 * UX-9.1 — Workspace Active chrome (border · shadow · title · background ·
 *   accent · indicators). Token Freeze: UI_TOKENS + existing CSS vars only.
 *   Reads WindowManager.activeId only — does NOT drive FocusRegistry.
 * Props surface unchanged (FloatingWindowProps). No local geometry state.
 * No WindowManager imports. No geometry / dock / drag / resize / z-order changes.
 * Authority: FloatingWindowProps (D56.1 API Freeze) · D58.0 · UX-9.1.
 */

import type { PointerEvent as ReactPointerEvent } from "react";
import { UI_TOKENS } from "@/lib/ui/tokens";
import type { FloatingWindowProps } from "./FloatingWindowTypes";
import { useWindowContext } from "./WindowContext";
import { useWindowDrag } from "./WindowDragContext";
import { useWindowResize } from "./WindowResizeContext";
import type { WindowResizeEdge } from "./WindowResizeBridge";
import {
  FLOATING_WINDOW_RESIZE_EDGES,
  FloatingWindowResizeHandle,
} from "./FloatingWindowResizeHandle";

/**
 * Presentational chrome composed from existing D48 / UI_TOKENS only.
 * Token Freeze — no hardcoded colors · no hex · no rgb/rgba · no new palette.
 * Geometry remains inline style (API Freeze).
 */
const FLOATING_WINDOW_CHROME = {
  rootBase: ["flex h-full flex-col overflow-hidden", UI_TOKENS.radius.md].join(
    " ",
  ),
  rootActive: [
    UI_TOKENS.border.accentSoft,
    "bg-[var(--app-surface)]",
    UI_TOKENS.shadow.md,
  ].join(" "),
  rootInactive: [
    UI_TOKENS.border.default,
    "bg-[var(--app-surface-muted)]",
    UI_TOKENS.shadow.sm,
  ].join(" "),
  headerBase: [
    "flex h-7 shrink-0 items-center justify-between gap-2 px-2",
    UI_TOKENS.border.bottom,
    "cursor-grab active:cursor-grabbing select-none",
  ].join(" "),
  headerActive: "bg-[var(--app-accent)]/10",
  headerInactive: "bg-[var(--app-surface-muted)]",
  titleActive:
    "min-w-0 truncate text-[11px] font-semibold tracking-tight text-[var(--app-heading)]",
  titleInactive:
    "min-w-0 truncate text-[11px] font-medium tracking-tight text-[var(--app-text-muted)]",
  accentActive: [
    "h-1.5 w-1.5 shrink-0",
    UI_TOKENS.radius.full,
    "bg-[var(--app-accent)]",
  ].join(" "),
  accentInactive: [
    "h-1.5 w-1.5 shrink-0",
    UI_TOKENS.radius.full,
    "bg-[var(--app-border)]",
  ].join(" "),
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
  const { state } = useWindowContext();
  const { beginDrag, updateDrag, endDrag } = useWindowDrag();
  const { beginResize, updateResize, endResize } = useWindowResize();

  /** Workspace Active only — ≠ Window Focus ≠ Panel Selection (UX-9.1). */
  const isActive = state.activeId === model.id;

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

  const rootClass = [
    FLOATING_WINDOW_CHROME.rootBase,
    isActive
      ? FLOATING_WINDOW_CHROME.rootActive
      : FLOATING_WINDOW_CHROME.rootInactive,
  ].join(" ");

  const headerClass = [
    FLOATING_WINDOW_CHROME.headerBase,
    isActive
      ? FLOATING_WINDOW_CHROME.headerActive
      : FLOATING_WINDOW_CHROME.headerInactive,
  ].join(" ");

  return (
    <div
      data-floating-window={model.id}
      data-workspace-active={isActive ? "true" : "false"}
      className={rootClass}
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
        className={headerClass}
        onPointerDown={onTitlePointerDown}
        onPointerMove={onTitlePointerMove}
        onPointerUp={onTitlePointerUp}
      >
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <span
            className={
              isActive
                ? FLOATING_WINDOW_CHROME.accentActive
                : FLOATING_WINDOW_CHROME.accentInactive
            }
            data-workspace-active-indicator={isActive ? "true" : "false"}
            aria-hidden="true"
          />
          <span
            className={
              isActive
                ? FLOATING_WINDOW_CHROME.titleActive
                : FLOATING_WINDOW_CHROME.titleInactive
            }
          >
            {model.title}
          </span>
        </div>
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
