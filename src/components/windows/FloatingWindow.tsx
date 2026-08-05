"use client";

/**
 * D56.2 — Floating Windows Foundation · FloatingWindow.
 * D57.3 — Title bar Pointer Events → WindowDragBridge.
 * D58.2 — Eight-edge ResizeHandles → WindowResizeBridge.
 * UX-1.1 — Visual chrome only (D48 tokens); props / lifecycle unchanged.
 * UX-9.1 — Workspace Active chrome (border · shadow · title · background ·
 *   accent · indicators). Token Freeze: UI_TOKENS + existing CSS vars only.
 * UX-9.2 — Focus + Selection Visual chrome (observe FocusRegistry +
 *   SelectionRegistry only). Visual Priority: Active > Focused > Selected.
 *   Never mutates FocusRegistry or SelectionRegistry.
 * UX-9.3 — Hover + Discoverability chrome (observe useHover + shared Pipeline
 *   → Snapshot → views). Visual Priority: Active > Focused > Selected >
 *   Hover > Discoverability. Never mutates HoverRegistry. Never registers
 *   Visibility SSOT. Discoverability ≠ window lifecycle.
 * Geometry / dock / drag / resize / z-order unchanged.
 * Authority: FloatingWindowProps (D56.1) · D58.0 · UX-9.1 · UX-9.2 · UX-9.3.
 */

import type { PointerEvent as ReactPointerEvent } from "react";
import { UI_TOKENS } from "@/lib/ui/tokens";
import type { DiscoverabilityPipeline } from "@/ui/discoverability";
import { asFocusTargetId, useFocus } from "@/ui/focus";
import { asHoverWindowId, useHover } from "@/ui/hover";
import { asSelectionWindowId, useSelection } from "@/ui/selection";
import { asVisibilityId } from "@/ui/visibility";
import {
  DiscoverabilityView,
  queryDiscSnapshot,
} from "@/ui/visual-integration";
import type { FloatingWindowModel } from "./FloatingWindowTypes";
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
 * Visual Priority Freeze: Active > Focused > Selected > Hover > Discoverability.
 */
const FLOATING_WINDOW_CHROME = {
  rootBase: ["flex h-full flex-col overflow-hidden", UI_TOKENS.radius.md].join(
    " ",
  ),
  /** Highest priority — Workspace Active */
  rootActive: [
    UI_TOKENS.border.accentSoft,
    "bg-[var(--app-surface)]",
    UI_TOKENS.shadow.md,
  ].join(" "),
  /** Focused (when not Active) */
  rootFocused: [
    "border border-[var(--app-accent)]/25",
    "bg-[var(--app-surface)]",
    UI_TOKENS.shadow.sm,
  ].join(" "),
  /** Selected (when not Active and not Focused) */
  rootSelected: [
    UI_TOKENS.border.default,
    "bg-[var(--app-surface)]",
    "ring-1 ring-inset ring-[var(--app-accent)]/20",
    UI_TOKENS.shadow.sm,
  ].join(" "),
  /** Hover (when not Active / Focused / Selected) */
  rootHovered: [
    UI_TOKENS.border.default,
    "bg-[var(--app-surface)]",
    "ring-1 ring-inset ring-[var(--app-border)]",
    UI_TOKENS.shadow.sm,
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
  headerFocused: "bg-[var(--app-accent)]/5",
  headerHovered: "bg-[var(--app-surface)]",
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
  focusBadge: [
    "shrink-0 px-1 py-0 text-[8px] font-semibold uppercase tracking-wide",
    UI_TOKENS.radius.md,
    "text-[var(--app-accent)] bg-[var(--app-accent)]/10",
  ].join(" "),
  selectionBadge: [
    "shrink-0 px-1 py-0 text-[8px] font-semibold uppercase tracking-wide",
    UI_TOKENS.radius.md,
    "text-[var(--app-text-muted)] bg-[var(--app-surface-muted)]",
    "ring-1 ring-inset ring-[var(--app-accent)]/20",
  ].join(" "),
  hoverBadge: [
    "shrink-0 px-1 py-0 text-[8px] font-semibold uppercase tracking-wide",
    UI_TOKENS.radius.md,
    "text-[var(--app-text-muted)] bg-[var(--app-surface)]",
    "ring-1 ring-inset ring-[var(--app-border)]",
  ].join(" "),
  hoverOverlay: [
    "pointer-events-none absolute inset-0",
    "ring-1 ring-inset ring-[var(--app-border)]/60",
  ].join(" "),
  discHint: [
    "shrink-0 px-1 py-0 text-[8px] font-medium tracking-wide",
    UI_TOKENS.radius.md,
    "text-[var(--app-text-muted)] bg-[var(--app-surface-muted)]",
  ].join(" "),
  contentSelected: [
    "mt-1 px-1.5 py-1 text-[10px]",
    UI_TOKENS.radius.md,
    "bg-[var(--app-accent)]/5 text-[var(--app-text-muted)]",
    "ring-1 ring-inset ring-[var(--app-accent)]/15",
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

type FloatingWindowChromeProps = Readonly<{
  window: FloatingWindowModel;
  /**
   * Shared composition pipeline from FloatingWindowBridge.
   * Optional for presentational FloatingWindowLayer (no product Discoverability).
   * Never create a pipeline inside FloatingWindow (Pipeline Lifetime Freeze).
   */
  pipeline?: DiscoverabilityPipeline;
}>;

export function FloatingWindow({
  window: model,
  pipeline,
}: FloatingWindowChromeProps) {
  const { state } = useWindowContext();
  const { registry: focusRegistry } = useFocus();
  const { registry: selectionRegistry } = useSelection();
  const { registry: hoverRegistry } = useHover();
  const { beginDrag, updateDrag, endDrag } = useWindowDrag();
  const { beginResize, updateResize, endResize } = useWindowResize();

  /** Workspace Active ≠ Focused ≠ Selected ≠ Hover (UX-9.1–UX-9.3). */
  const isActive = state.activeId === model.id;
  const isFocused = focusRegistry.isFocused(asFocusTargetId(model.id));
  const selectionState = selectionRegistry.getState();
  const isSelected = selectionState.selectedWindowIds.has(
    asSelectionWindowId(model.id),
  );
  const selectedContentIds = [...selectionState.selectedContentIds];
  const hoverState = hoverRegistry.getState();
  const isHovered =
    hoverState.hoveredWindowId === asHoverWindowId(model.id);

  /** Discoverability — shared Pipeline → Snapshot → views (empty SSOT → empty). */
  const discSnapshot =
    pipeline !== undefined
      ? queryDiscSnapshot(pipeline, asVisibilityId(model.id))
      : undefined;
  const hasDiscoverabilityHint =
    discSnapshot !== undefined &&
    (discSnapshot.tooltip !== undefined ||
      discSnapshot.shortcutHint !== undefined ||
      discSnapshot.commandDescription !== undefined ||
      discSnapshot.contextHelp !== undefined);

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

  /** Visual Priority: Active > Focused > Selected > Hover > Discoverability */
  const rootClass = [
    FLOATING_WINDOW_CHROME.rootBase,
    "relative",
    isActive
      ? FLOATING_WINDOW_CHROME.rootActive
      : isFocused
        ? FLOATING_WINDOW_CHROME.rootFocused
        : isSelected
          ? FLOATING_WINDOW_CHROME.rootSelected
          : isHovered
            ? FLOATING_WINDOW_CHROME.rootHovered
            : FLOATING_WINDOW_CHROME.rootInactive,
  ].join(" ");

  const headerClass = [
    FLOATING_WINDOW_CHROME.headerBase,
    isActive
      ? FLOATING_WINDOW_CHROME.headerActive
      : isFocused
        ? FLOATING_WINDOW_CHROME.headerFocused
        : isHovered
          ? FLOATING_WINDOW_CHROME.headerHovered
          : FLOATING_WINDOW_CHROME.headerInactive,
  ].join(" ");

  return (
    <div
      data-floating-window={model.id}
      data-workspace-active={isActive ? "true" : "false"}
      data-window-focused={isFocused ? "true" : "false"}
      data-window-selected={isSelected ? "true" : "false"}
      data-window-hovered={isHovered ? "true" : "false"}
      data-discoverability-hint={hasDiscoverabilityHint ? "true" : "false"}
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
      {isHovered && !isActive && !isFocused && !isSelected ? (
        <div
          className={FLOATING_WINDOW_CHROME.hoverOverlay}
          data-hover-overlay="true"
          aria-hidden="true"
        />
      ) : null}
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
          {isFocused ? (
            <span
              className={FLOATING_WINDOW_CHROME.focusBadge}
              data-focus-badge="true"
            >
              Focus
            </span>
          ) : null}
          {isSelected ? (
            <span
              className={FLOATING_WINDOW_CHROME.selectionBadge}
              data-selection-badge="true"
            >
              Sel
            </span>
          ) : null}
          {isHovered ? (
            <span
              className={FLOATING_WINDOW_CHROME.hoverBadge}
              data-hover-badge="true"
            >
              Hover
            </span>
          ) : null}
          {hasDiscoverabilityHint && discSnapshot !== undefined ? (
            <span
              className={FLOATING_WINDOW_CHROME.discHint}
              data-discoverability-indicator="true"
            >
              <DiscoverabilityView snapshot={discSnapshot} />
            </span>
          ) : null}
        </div>
        <button
          type="button"
          aria-label="Close window"
          className={FLOATING_WINDOW_CHROME.close}
        >
          ×
        </button>
      </header>
      <section className={FLOATING_WINDOW_CHROME.body}>
        {model.content}
        {isSelected && selectedContentIds.length > 0 ? (
          <div
            className={FLOATING_WINDOW_CHROME.contentSelected}
            data-content-selected="true"
          >
            Content · {selectedContentIds.join(", ")}
          </div>
        ) : null}
      </section>
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
