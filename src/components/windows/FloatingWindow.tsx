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
 * UX-9.4 — Keyboard Navigation chrome (observe useKeyboardNavigation only).
 *   Visual Priority: Active > Focused > Selected > Hover > Keyboard Navigation
 *   > Discoverability. Never mutates KeyboardNavigationRegistry.
 *   Keyboard ≠ Focus · additive badge / arrow / Escape glyph only.
 * UX-9.5 — Clipboard chrome (observe useClipboard + Bridge feedback only).
 *   Additive badge / status / ephemeral copy·paste feedback.
 *   Never mutates ClipboardRegistry · never calls Bridge · never navigator.clipboard.
 *   Clipboard feedback never changes Visual Priority cascade.
 * UX-9.6 — Command Palette chrome (observe overlay + command feedback only).
 *   Additive palette status / accepted·rejected / execution badge.
 *   Never calls dispatch() · clear() · createCommandEnvelope().
 *   Palette feedback never changes Visual Priority cascade.
 * UX-9.7 — Undo / Redo chrome (observe UndoRedoBridge overlay + feedback only).
 *   Additive availability badges / ephemeral undo·redo feedback.
 *   Never calls executeUndo/executeRedo · never ThinHistoryAdapter · never stacks.
 *   Undo/Redo chrome never changes Visual Priority cascade.
 * UX-9.8 — Workspace Polish (chrome only). Visual System Consistency ·
 *   Chrome Density · Lovable Identity via UI_TOKENS + existing CSS vars.
 *   Animation Freeze: opacity · transform · shadow · border-color ·
 *   background-color only · never transition-all · never geometry.
 *   Never mutates registries · never changes cascade · never layout/drag/resize.
 * Geometry / dock / drag / resize / z-order unchanged.
 * Authority: FloatingWindowProps (D56.1) · D58.0 · UX-9.1–UX-9.8.
 */

import type { PointerEvent as ReactPointerEvent } from "react";
import { useSyncExternalStore } from "react";
import { UI_TOKENS } from "@/lib/ui/tokens";
import { useClipboard } from "@/ui/clipboard";
import type { DiscoverabilityPipeline } from "@/ui/discoverability";
import { asFocusTargetId, useFocus } from "@/ui/focus";
import { asHoverWindowId, useHover } from "@/ui/hover";
import {
  KeyboardNavigationDirection,
  useKeyboardNavigation,
} from "@/ui/keyboard-nav";
import { asSelectionWindowId, useSelection } from "@/ui/selection";
import { asVisibilityId } from "@/ui/visibility";
import {
  DiscoverabilityView,
  queryDiscSnapshot,
} from "@/ui/visual-integration";
import {
  getClipboardFeedback,
  subscribeClipboardFeedback,
} from "./clipboard";
import {
  getCommandFeedback,
  getOverlayState,
  subscribeCommandFeedback,
  subscribeOverlayState,
} from "./commands";
import {
  getUndoRedoFeedback,
  getUndoRedoOverlay,
  subscribeUndoRedoFeedback,
  subscribeUndoRedoOverlay,
} from "./history";
import type { FloatingWindowModel } from "./FloatingWindowTypes";
import { useWindowContext } from "./WindowContext";
import { useWindowDrag } from "./WindowDragContext";
import { useWindowResize } from "./WindowResizeContext";
import type { WindowResizeEdge } from "./WindowResizeBridge";
import {
  FLOATING_WINDOW_RESIZE_EDGES,
  FloatingWindowResizeHandle,
} from "./FloatingWindowResizeHandle";
import {
  INTERACTION_ELEVATION,
  INTERACTION_FOCUS_RING,
  INTERACTION_INDICATOR_SHELL,
  INTERACTION_INDICATOR_STATUS_SHELL,
  INTERACTION_MOTION,
  INTERACTION_STATE,
} from "./InteractionChromeTokens";

/**
 * Presentational chrome composed from Design System CSS vars via InteractionChromeTokens.
 * Token Freeze — no hardcoded colors · no hex · no rgb/rgba · no new palette.
 * Geometry remains inline style (API Freeze).
 * Visual Priority Freeze: Active > Focused > Selected > Hover >
 *   Keyboard Navigation > Discoverability.
 * Clipboard · Palette · Undo / Redo chrome are additive · outside cascade.
 * UX-I4 — Interaction clarity · elevation hierarchy · focus ring · motion.
 * Animation Freeze — colors / opacity / transform / shadow only · no transition-all.
 */

function keyboardDirectionGlyph(
  direction: KeyboardNavigationDirection,
): string {
  switch (direction) {
    case KeyboardNavigationDirection.NEXT:
      return "→";
    case KeyboardNavigationDirection.PREVIOUS:
      return "←";
    case KeyboardNavigationDirection.UP:
      return "↑";
    case KeyboardNavigationDirection.DOWN:
      return "↓";
    case KeyboardNavigationDirection.LEFT:
      return "←";
    case KeyboardNavigationDirection.RIGHT:
      return "→";
    case KeyboardNavigationDirection.ESCAPE:
      return "Esc";
    default:
      return "·";
  }
}

/** Shared indicator shell — Visual System Consistency Freeze. */
const INDICATOR_SHELL = INTERACTION_INDICATOR_SHELL;

/** Shared status / glyph shell — same height · radius · spacing · rhythm. */
const INDICATOR_STATUS_SHELL = INTERACTION_INDICATOR_STATUS_SHELL;

const FLOATING_WINDOW_CHROME = {
  rootBase: [
    "flex h-full flex-col overflow-hidden",
    "rounded-[var(--radius-control)]",
    INTERACTION_MOTION.feedback,
  ].join(" "),
  /** Highest priority — Workspace Active */
  rootActive: [
    UI_TOKENS.border.accentSoft,
    INTERACTION_STATE.defaultSurface,
    INTERACTION_ELEVATION.active,
  ].join(" "),
  /** Focused (when not Active) */
  rootFocused: [
    "border border-[var(--focus-ring-color)]/35",
    INTERACTION_STATE.defaultSurface,
    INTERACTION_ELEVATION.focused,
    "ring-1 ring-inset ring-[var(--focus-ring-color)]/25",
  ].join(" "),
  /** Selected (when not Active and not Focused) */
  rootSelected: [
    UI_TOKENS.border.default,
    INTERACTION_STATE.defaultSurface,
    INTERACTION_STATE.selectedRing,
    INTERACTION_ELEVATION.selected,
  ].join(" "),
  /** Hover (when not Active / Focused / Selected) */
  rootHovered: [
    UI_TOKENS.border.default,
    INTERACTION_STATE.defaultSurface,
    "ring-1 ring-inset ring-[var(--color-border-muted)]",
    INTERACTION_ELEVATION.hover,
  ].join(" "),
  rootInactive: [
    UI_TOKENS.border.default,
    INTERACTION_STATE.inactiveSurface,
    INTERACTION_ELEVATION.inactive,
  ].join(" "),
  /** Chrome Density — consistent header height · padding · gaps via tokens */
  headerBase: [
    "flex h-8 shrink-0 items-center justify-between",
    UI_TOKENS.spacing.gap2,
    UI_TOKENS.spacing.px2,
    UI_TOKENS.border.bottom,
    "cursor-grab active:cursor-grabbing select-none",
    INTERACTION_MOTION.enter,
  ].join(" "),
  headerActive: INTERACTION_STATE.activeAccent,
  headerFocused: INTERACTION_STATE.focusedAccent,
  headerHovered: INTERACTION_STATE.defaultSurface,
  headerInactive: INTERACTION_STATE.inactiveSurface,
  titleActive:
    "min-w-0 truncate text-[length:var(--typography-label-sm-font-size)] font-semibold tracking-tight text-[var(--color-text-primary)]",
  titleInactive:
    "min-w-0 truncate text-[length:var(--typography-label-sm-font-size)] font-medium tracking-tight text-[var(--color-text-muted)]",
  accentActive: [
    "h-1.5 w-1.5 shrink-0",
    UI_TOKENS.radius.full,
    "bg-[var(--color-brand-primary)]",
    INTERACTION_MOTION.enter,
  ].join(" "),
  accentInactive: [
    "h-1.5 w-1.5 shrink-0",
    UI_TOKENS.radius.full,
    "bg-[var(--color-border-muted)]",
    INTERACTION_MOTION.enter,
  ].join(" "),
  focusBadge: [
    INDICATOR_SHELL,
    "text-[var(--focus-ring-color)] bg-[var(--focus-ring-color)]/10",
  ].join(" "),
  selectionBadge: [
    INDICATOR_SHELL,
    "text-[var(--color-text-muted)] bg-[var(--color-surface-canvas)]",
    INTERACTION_STATE.selectedRing,
  ].join(" "),
  hoverBadge: [
    INDICATOR_SHELL,
    "text-[var(--color-text-muted)] bg-[var(--color-surface-default)]",
    "ring-1 ring-inset ring-[var(--color-border-muted)]",
  ].join(" "),
  hoverOverlay: [
    "pointer-events-none absolute inset-0",
    "ring-1 ring-inset ring-[var(--color-border-muted)]/70",
    INTERACTION_MOTION.enter,
  ].join(" "),
  /** Keyboard Navigation — additive · never replaces Active / Focus / Hover */
  keyboardBadge: [
    INDICATOR_SHELL,
    "text-[var(--color-text-muted)] bg-[var(--color-surface-canvas)]",
    "ring-1 ring-inset ring-[var(--color-border-default)]",
  ].join(" "),
  keyboardArrow: [
    INDICATOR_STATUS_SHELL,
    "text-[var(--color-text-muted)] bg-[var(--color-surface-default)]",
  ].join(" "),
  /** Clipboard — additive · independent domain · never changes Visual Priority */
  clipboardBadge: [
    INDICATOR_SHELL,
    "text-[var(--color-text-muted)] bg-[var(--color-surface-canvas)]",
    "ring-1 ring-inset ring-[var(--color-border-default)]",
  ].join(" "),
  clipboardStatus: [
    INDICATOR_STATUS_SHELL,
    "text-[var(--color-text-muted)] bg-[var(--color-surface-default)]",
  ].join(" "),
  clipboardFeedback: [
    INDICATOR_SHELL,
    "text-[var(--color-brand-primary)] bg-[var(--color-brand-primary)]/10",
  ].join(" "),
  /** Command Palette — additive · temporary · never changes Visual Priority */
  paletteBadge: [
    INDICATOR_SHELL,
    "text-[var(--color-text-muted)] bg-[var(--color-surface-canvas)]",
    "ring-1 ring-inset ring-[var(--color-border-default)]",
  ].join(" "),
  paletteStatus: [
    INDICATOR_STATUS_SHELL,
    "text-[var(--color-text-muted)] bg-[var(--color-surface-default)]",
  ].join(" "),
  commandFeedback: [
    INDICATOR_SHELL,
    "text-[var(--color-brand-primary)] bg-[var(--color-brand-primary)]/10",
  ].join(" "),
  /** Undo / Redo — additive · independent · never changes Visual Priority */
  undoRedoBadge: [
    INDICATOR_SHELL,
    "text-[var(--color-text-muted)] bg-[var(--color-surface-canvas)]",
    "ring-1 ring-inset ring-[var(--color-border-default)]",
  ].join(" "),
  undoRedoFeedback: [
    INDICATOR_SHELL,
    "text-[var(--color-brand-primary)] bg-[var(--color-brand-primary)]/10",
  ].join(" "),
  discHint: [
    INDICATOR_STATUS_SHELL,
    "text-[var(--color-text-muted)] bg-[var(--color-surface-canvas)]",
  ].join(" "),
  contentSelected: [
    UI_TOKENS.spacing.mt1,
    UI_TOKENS.spacing.px15,
    UI_TOKENS.spacing.py1,
    "text-[length:var(--typography-caption-xs-font-size)]",
    "rounded-[var(--radius-container)]",
    INTERACTION_ELEVATION.inactive,
    INTERACTION_STATE.selectedSurface,
    INTERACTION_STATE.selectedRing,
    INTERACTION_MOTION.enter,
  ].join(" "),
  close: [
    "inline-flex h-5 w-5 shrink-0 items-center justify-center",
    "rounded-[var(--radius-container)]",
    "text-[length:var(--typography-body-sm-font-size)] leading-none text-[var(--color-text-muted)]",
    INTERACTION_STATE.hoverSurface,
    INTERACTION_FOCUS_RING,
    INTERACTION_MOTION.enter,
  ].join(" "),
  body: [
    "min-h-0 flex-1 overflow-auto",
    UI_TOKENS.spacing.p2,
    "bg-[var(--color-surface-default)] text-[length:var(--typography-body-sm-font-size)] text-[var(--color-text-primary)]",
    INTERACTION_MOTION.enter,
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
  const { registry: keyboardRegistry } = useKeyboardNavigation();
  const { registry: clipboardApi } = useClipboard();
  const clipboardFeedback = useSyncExternalStore(
    subscribeClipboardFeedback,
    getClipboardFeedback,
    getClipboardFeedback,
  );
  const paletteOverlay = useSyncExternalStore(
    subscribeOverlayState,
    getOverlayState,
    getOverlayState,
  );
  const commandFeedback = useSyncExternalStore(
    subscribeCommandFeedback,
    getCommandFeedback,
    getCommandFeedback,
  );
  const undoRedoOverlay = useSyncExternalStore(
    subscribeUndoRedoOverlay,
    getUndoRedoOverlay,
    getUndoRedoOverlay,
  );
  const undoRedoFeedback = useSyncExternalStore(
    subscribeUndoRedoFeedback,
    getUndoRedoFeedback,
    getUndoRedoFeedback,
  );
  const { beginDrag, updateDrag, endDrag } = useWindowDrag();
  const { beginResize, updateResize, endResize } = useWindowResize();

  /** Workspace Active ≠ Focused ≠ Selected ≠ Hover ≠ Keyboard ≠ Clipboard ≠ Palette ≠ Undo. */
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
  const keyboardState = keyboardRegistry.getState();
  const lastDirection = keyboardState.lastDirection;
  const hasKeyboardNav = lastDirection !== null;
  const clipboardEntry = clipboardApi.getState().entry;
  const hasClipboard = clipboardEntry !== null;
  const showCopyFeedback = clipboardFeedback?.kind === "copy";
  const showPasteFeedback = clipboardFeedback?.kind === "paste";
  const paletteOpen = paletteOverlay.open;
  const showAcceptedFeedback = commandFeedback?.kind === "accepted";
  const showRejectedFeedback = commandFeedback?.kind === "rejected";
  const hasExecutionBadge = commandFeedback !== null;
  const canUndo = undoRedoOverlay.canUndo;
  const canRedo = undoRedoOverlay.canRedo;
  const showUndoAvailableFeedback =
    undoRedoFeedback?.kind === "undo-available";
  const showRedoAvailableFeedback =
    undoRedoFeedback?.kind === "redo-available";
  const showUndoExecutedFeedback =
    undoRedoFeedback?.kind === "undo-executed";
  const showRedoExecutedFeedback =
    undoRedoFeedback?.kind === "redo-executed";

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

  /** Visual Priority: Active > Focused > Selected > Hover > Keyboard Navigation > Discoverability
   *  Clipboard chrome is additive and does not participate in this cascade.
   *  Command Palette chrome is additive and does not participate in this cascade.
   *  Undo / Redo chrome is additive and does not participate in this cascade. */
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
      data-keyboard-nav={hasKeyboardNav ? "true" : "false"}
      data-keyboard-direction={lastDirection ?? undefined}
      data-clipboard={hasClipboard ? "true" : "false"}
      data-clipboard-feedback={clipboardFeedback?.kind ?? undefined}
      data-command-palette={paletteOpen ? "true" : "false"}
      data-command-feedback={commandFeedback?.kind ?? undefined}
      data-undo={canUndo ? "true" : "false"}
      data-redo={canRedo ? "true" : "false"}
      data-undo-feedback={undoRedoFeedback?.kind ?? undefined}
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
        <div
          className={`flex min-w-0 flex-1 items-center ${UI_TOKENS.spacing.gap2}`}
        >
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
              title="Esta ventana tiene el foco de teclado"
            >
              Enfoque
            </span>
          ) : null}
          {isSelected ? (
            <span
              className={FLOATING_WINDOW_CHROME.selectionBadge}
              data-selection-badge="true"
              title="Ventana seleccionada"
            >
              Sel
            </span>
          ) : null}
          {isHovered ? (
            <span
              className={FLOATING_WINDOW_CHROME.hoverBadge}
              data-hover-badge="true"
              title="Puntero sobre esta ventana"
            >
              Hover
            </span>
          ) : null}
          {hasKeyboardNav && lastDirection !== null ? (
            <>
              <span
                className={FLOATING_WINDOW_CHROME.keyboardBadge}
                data-keyboard-badge="true"
              >
                Nav
              </span>
              <span
                className={FLOATING_WINDOW_CHROME.keyboardArrow}
                data-keyboard-arrow="true"
                aria-hidden="true"
              >
                {keyboardDirectionGlyph(lastDirection)}
              </span>
            </>
          ) : null}
          {hasClipboard ? (
            <>
              <span
                className={FLOATING_WINDOW_CHROME.clipboardBadge}
                data-clipboard-badge="true"
              >
                Clip
              </span>
              <span
                className={FLOATING_WINDOW_CHROME.clipboardStatus}
                data-clipboard-status="true"
              >
                Ready
              </span>
            </>
          ) : null}
          {showCopyFeedback ? (
            <span
              className={FLOATING_WINDOW_CHROME.clipboardFeedback}
              data-clipboard-copy-feedback="true"
            >
              Copied
            </span>
          ) : null}
          {showPasteFeedback ? (
            <span
              className={FLOATING_WINDOW_CHROME.clipboardFeedback}
              data-clipboard-paste-feedback="true"
            >
              Pasted
            </span>
          ) : null}
          {paletteOpen ? (
            <>
              <span
                className={FLOATING_WINDOW_CHROME.paletteBadge}
                data-palette-badge="true"
              >
                Cmd
              </span>
              <span
                className={FLOATING_WINDOW_CHROME.paletteStatus}
                data-palette-status="true"
              >
                Open
              </span>
            </>
          ) : null}
          {hasExecutionBadge ? (
            <span
              className={FLOATING_WINDOW_CHROME.paletteBadge}
              data-execution-badge="true"
            >
              Exec
            </span>
          ) : null}
          {showAcceptedFeedback ? (
            <span
              className={FLOATING_WINDOW_CHROME.commandFeedback}
              data-command-accepted-feedback="true"
            >
              Accepted
            </span>
          ) : null}
          {showRejectedFeedback ? (
            <span
              className={FLOATING_WINDOW_CHROME.commandFeedback}
              data-command-rejected-feedback="true"
            >
              Rejected
            </span>
          ) : null}
          {canUndo ? (
            <span
              className={FLOATING_WINDOW_CHROME.undoRedoBadge}
              data-undo-badge="true"
            >
              Undo
            </span>
          ) : null}
          {canRedo ? (
            <span
              className={FLOATING_WINDOW_CHROME.undoRedoBadge}
              data-redo-badge="true"
            >
              Redo
            </span>
          ) : null}
          {showUndoAvailableFeedback ? (
            <span
              className={FLOATING_WINDOW_CHROME.undoRedoFeedback}
              data-undo-available-feedback="true"
            >
              Undo ready
            </span>
          ) : null}
          {showRedoAvailableFeedback ? (
            <span
              className={FLOATING_WINDOW_CHROME.undoRedoFeedback}
              data-redo-available-feedback="true"
            >
              Redo ready
            </span>
          ) : null}
          {showUndoExecutedFeedback ? (
            <span
              className={FLOATING_WINDOW_CHROME.undoRedoFeedback}
              data-undo-executed-feedback="true"
            >
              Undone
            </span>
          ) : null}
          {showRedoExecutedFeedback ? (
            <span
              className={FLOATING_WINDOW_CHROME.undoRedoFeedback}
              data-redo-executed-feedback="true"
            >
              Redone
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
          aria-label="Cerrar ventana flotante"
          title="Cerrar esta ventana (no elimina el Workspace principal)"
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
