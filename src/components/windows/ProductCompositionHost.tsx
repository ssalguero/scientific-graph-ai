"use client";

/**
 * UX-9.1 — ProductCompositionHost.
 * UX-9.2 — Provider Composition Completion: FocusProvider → SelectionProvider.
 *   FocusSelectionVisualSeed (temporary · Demo Minimality Freeze).
 * UX-9.3 — HoverProvider mount · HoverVisualSeed (temporary · ephemeral).
 * UX-9.4 — KeyboardNavigationProvider · KeyboardNavigationVisualSeed ·
 *   KeyboardNavigationDomHost (onKeyDown → move · Paint Independence).
 * UX-9.5 — ClipboardProvider · ClipboardVisualSeed · ClipboardDomHost
 *   (Ctrl/Cmd+C|V → Bridge · Paint Independence).
 * UX-9.6 — InteractionCommandProvider · CommandPaletteDomHost
 *   (Ctrl/Cmd+K · Esc · Overlay · Bridge → Dispatcher · Paint Independence).
 * UX-9.7 — UndoRedoDomHost (Ctrl/Cmd+Z|Y|Shift+Z → Bridge → ThinHistoryAdapter
 *   · structural undo/redo · Paint Independence).
 * UX-9.8 — WorkspaceDiagnosticsOverlay (env-gated · query-only · under
 *   UndoRedoDomHost). No new Provider · Context · Registry · Dispatcher.
 *   Polish lives in FloatingWindow chrome only.
 *
 * Authorized composition point for the Productivity Layer.
 * Mounts certified WindowManager + FocusProvider + SelectionProvider +
 * HoverProvider + KeyboardNavigationProvider + ClipboardProvider +
 * InteractionCommandProvider only.
 * No new Provider · Context · Registry · Dispatcher · Contract.
 * CommandPaletteProvider is never mounted (Palette Module Purity).
 * ThinHistoryAdapter is the sole UX-9.7 history exception (not a Registry).
 *
 * Small Incremental Visual Integration:
 * Future UX-9 phases extend this host; they never replace it.
 *
 * Activation Seed Freeze:
 * WorkspaceActivationSeed is a temporary integration utility.
 * It MUST NOT become a permanent source of production windows.
 * If product windows already exist → NO-OP.
 *
 * Focus & Selection Seed Freeze:
 * FocusSelectionVisualSeed is a temporary visual-integration utility.
 * Demo Minimality: focus + selectWindow + selectContent only.
 * Auto NO-OP when focus/selection already present.
 *
 * Hover Visual Seed Freeze / Hover Ephemerality Freeze:
 * HoverVisualSeed is a temporary one-shot demo init.
 * NO-OP when hover already present. Permanently inactive after first pass.
 * Never re-synchronizes with real hover.
 *
 * Keyboard Seed Canonical / Ephemerality Freeze:
 * KeyboardNavigationVisualSeed initializes via move(NEXT) only — never next().
 * One-shot · permanently inactive after write or existing direction.
 *
 * Keyboard DOM Freeze:
 * KeyboardNavigationDomHost is the sole onKeyDown surface for navigation keys.
 * No document/window listeners.
 *
 * Clipboard Seed / Ephemerality Freeze:
 * ClipboardVisualSeed is a temporary one-shot via Bridge.copy.
 * NO-OP when Clipboard already contains an entry.
 *
 * Clipboard DOM Freeze:
 * ClipboardDomHost is the sole Ctrl/Cmd+C|V capture surface.
 * Calls ClipboardIntegrationBridge only — never navigator.clipboard.
 *
 * Palette DOM Freeze:
 * CommandPaletteDomHost is the sole Ctrl/Cmd+K · Esc palette capture surface.
 * Overlay lives in Productivity Layer only — never src/ui/palette.
 *
 * Undo / Redo DOM Freeze:
 * UndoRedoDomHost is the sole Ctrl/Cmd+Z · Shift+Z · Y capture surface.
 * Calls UndoRedoBridge only — never Dispatcher · never Adapter directly.
 *
 * Diagnostics Visibility Freeze:
 * WorkspaceDiagnosticsOverlay mounts under UndoRedoDomHost only.
 * Visible only when NEXT_PUBLIC_WORKSPACE_DIAGNOSTICS=1 · otherwise null.
 * Query-only · never dispatch · mutate · clear · sync.
 */

import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from "react";
import { ClipboardProvider, useClipboard } from "@/ui/clipboard";
import { asFocusTargetId, FocusProvider, useFocus } from "@/ui/focus";
import {
  asHoverContentId,
  asHoverWindowId,
  HoverProvider,
  useHover,
} from "@/ui/hover";
import { InteractionCommandProvider } from "@/ui/interaction-commands";
import {
  KeyboardNavigationDirection,
  KeyboardNavigationProvider,
  useKeyboardNavigation,
} from "@/ui/keyboard-nav";
import {
  asSelectionContentId,
  asSelectionWindowId,
  SelectionProvider,
  useSelection,
} from "@/ui/selection";
import { clipboardIntegrationBridge } from "./clipboard";
import { CommandPaletteDomHost } from "./commands";
import { WorkspaceDiagnosticsOverlay } from "./diagnostics";
import { UndoRedoDomHost } from "./history";
import { useWindowContext } from "./WindowContext";
import { useWindowGeometry } from "./WindowGeometryContext";
import { WindowManager } from "./WindowManager";

export type ProductCompositionHostProps = Readonly<{
  children: ReactNode;
}>;

const SEED_WINDOW_A = "ux-9.1-seed-a";
const SEED_WINDOW_B = "ux-9.1-seed-b";
const SEED_CONTENT = "ux-9.2-seed-content";
const SEED_HOVER_CONTENT = "ux-9.3-seed-content";
const SEED_CLIPBOARD_TEXT = "UX-9.5 clipboard";

/**
 * Temporary integration utility only.
 * Disabled automatically when any product (or prior) windows exist.
 */
function WorkspaceActivationSeed() {
  const { state, api } = useWindowContext();
  const { geometryState } = useWindowGeometry();
  const seededRef = useRef(false);

  useEffect(() => {
    if (seededRef.current) {
      return;
    }
    // Activation Seed Freeze — product windows present → NO-OP
    if (state.windows.size > 0) {
      return;
    }
    seededRef.current = true;

    api.create({
      id: SEED_WINDOW_A,
      title: "Workspace A",
      visible: true,
    });
    api.create({
      id: SEED_WINDOW_B,
      title: "Workspace B",
      visible: true,
    });

    geometryState.set(SEED_WINDOW_A, {
      x: 48,
      y: 48,
      width: 320,
      height: 240,
    });
    geometryState.set(SEED_WINDOW_B, {
      x: 400,
      y: 96,
      width: 320,
      height: 240,
    });

    api.activate(SEED_WINDOW_A);
  }, [state.windows.size, api, geometryState]);

  return null;
}

/**
 * Temporary visual-integration utility only (UX-9.2).
 * Demo Minimality Freeze — focus · selectWindow · selectContent only.
 * Never toggle* · range* · multi-select · user-action simulation.
 */
function FocusSelectionVisualSeed() {
  const { state } = useWindowContext();
  const { registry: focusApi } = useFocus();
  const { registry: selectionApi } = useSelection();
  const seededRef = useRef(false);

  useEffect(() => {
    if (seededRef.current) {
      return;
    }

    const focusState = focusApi.getState();
    const selectionState = selectionApi.getState();
    const selectionEmpty =
      selectionState.selectedWindowIds.size === 0 &&
      selectionState.selectedContentIds.size === 0 &&
      selectionState.selectedSeriesIds.size === 0;

    // Focus & Selection Seed Freeze — product focus/selection present → NO-OP
    if (focusState.focusedId !== null || !selectionEmpty) {
      return;
    }
    if (state.windows.size === 0) {
      return;
    }

    const firstWindow = state.windows.values().next().value;
    if (!firstWindow) {
      return;
    }

    seededRef.current = true;

    // Demo Minimality Freeze — three writes only
    focusApi.focus(asFocusTargetId(firstWindow.id));
    selectionApi.selectWindow(asSelectionWindowId(firstWindow.id));
    selectionApi.selectContent(asSelectionContentId(SEED_CONTENT));
  }, [state.windows, focusApi, selectionApi]);

  return null;
}

/**
 * Temporary visual-integration utility only (UX-9.3).
 * Hover Visual Seed Freeze — hoverWindow + hoverContent only.
 * Hover Ephemerality Freeze — one-shot; permanently inactive after pass.
 * Never enter · leave · history · coordinates · clear · singleton.
 */
function HoverVisualSeed() {
  const { state } = useWindowContext();
  const { registry: hoverApi } = useHover();
  const seededRef = useRef(false);

  useEffect(() => {
    if (seededRef.current) {
      return;
    }

    const hoverState = hoverApi.getState();

    // Hover Visual Seed Freeze — product hover present → NO-OP forever
    if (
      hoverState.hoveredWindowId !== null ||
      hoverState.hoveredContentId !== null
    ) {
      seededRef.current = true;
      return;
    }
    if (state.windows.size === 0) {
      return;
    }

    const firstWindow = state.windows.values().next().value;
    if (!firstWindow) {
      return;
    }

    seededRef.current = true;

    // One-shot demo writes only (Hover Ephemerality Freeze)
    hoverApi.hoverWindow(asHoverWindowId(firstWindow.id));
    hoverApi.hoverContent(asHoverContentId(SEED_HOVER_CONTENT));
  }, [state.windows, hoverApi]);

  return null;
}

/**
 * Temporary visual-integration utility only (UX-9.4).
 * Keyboard Seed Canonical Freeze — move(NEXT) only · never next().
 * Keyboard Ephemerality Freeze — one-shot; permanently inactive after pass.
 */
function KeyboardNavigationVisualSeed() {
  const { state } = useWindowContext();
  const { registry } = useKeyboardNavigation();
  const seededRef = useRef(false);

  useEffect(() => {
    if (seededRef.current) {
      return;
    }

    const keyboardState = registry.getState();

    // Keyboard Ephemerality — existing direction → NO-OP forever
    if (keyboardState.lastDirection !== null) {
      seededRef.current = true;
      return;
    }
    if (state.windows.size === 0) {
      return;
    }

    seededRef.current = true;

    // Keyboard Seed Canonical Freeze — move(NEXT) only
    registry.move(KeyboardNavigationDirection.NEXT);
  }, [state.windows, registry]);

  return null;
}

/**
 * Temporary visual-integration utility only (UX-9.5).
 * Clipboard Seed Freeze — one-shot via Bridge.copy · never re-sync.
 * Obeys Clipboard Success Freeze · Entry Canonical Freeze.
 */
function ClipboardVisualSeed() {
  const { registry } = useClipboard();
  const seededRef = useRef(false);
  const [, setPaint] = useState(0);

  useEffect(() => {
    if (seededRef.current) {
      return;
    }

    // Clipboard Seed Freeze — existing entry → NO-OP forever
    if (registry.getState().entry !== null) {
      seededRef.current = true;
      return;
    }

    seededRef.current = true;

    void clipboardIntegrationBridge
      .copy(SEED_CLIPBOARD_TEXT, registry)
      .then(() => {
        setPaint((n) => n + 1);
      })
      .catch(() => {
        // Success Freeze — failure leaves Registry untouched; seed stays done
      });
  }, [registry]);

  return null;
}

/**
 * Sole keyboard capture surface for navigation (Keyboard DOM Freeze).
 * Translates keys → move(direction) only (Direction Normalization Freeze).
 * Paint Independence: ensures snapshot can reach chrome; mechanism not frozen.
 */
function KeyboardNavigationDomHost({ children }: { children: ReactNode }) {
  const { registry } = useKeyboardNavigation();
  const { state } = useWindowContext();
  const [, setPaint] = useState(0);

  // After seed (or any registry write), ensure chrome can observe the snapshot.
  useEffect(() => {
    if (registry.getState().lastDirection !== null) {
      setPaint((n) => n + 1);
    }
  }, [registry, state.windows.size]);

  const onKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    let direction: KeyboardNavigationDirection | null = null;

    if (event.key === "Tab") {
      direction = event.shiftKey
        ? KeyboardNavigationDirection.PREVIOUS
        : KeyboardNavigationDirection.NEXT;
      event.preventDefault();
    } else if (event.key === "ArrowUp") {
      direction = KeyboardNavigationDirection.UP;
      event.preventDefault();
    } else if (event.key === "ArrowDown") {
      direction = KeyboardNavigationDirection.DOWN;
      event.preventDefault();
    } else if (event.key === "ArrowLeft") {
      direction = KeyboardNavigationDirection.LEFT;
      event.preventDefault();
    } else if (event.key === "ArrowRight") {
      direction = KeyboardNavigationDirection.RIGHT;
      event.preventDefault();
    } else if (event.key === "Escape") {
      direction = KeyboardNavigationDirection.ESCAPE;
      event.preventDefault();
    }

    if (direction === null) {
      return;
    }

    registry.move(direction);
    setPaint((n) => n + 1);
  };

  return (
    <div
      data-keyboard-nav-host="true"
      tabIndex={0}
      onKeyDown={onKeyDown}
      className="h-full w-full outline-none"
    >
      {children}
    </div>
  );
}

/**
 * Sole Copy/Paste capture surface (Clipboard DOM Freeze).
 * Ctrl/Cmd+C · Ctrl/Cmd+V → Bridge only — never navigator.clipboard.
 */
function ClipboardDomHost({ children }: { children: ReactNode }) {
  const { registry } = useClipboard();
  const [, setPaint] = useState(0);

  useEffect(() => {
    if (registry.getState().entry !== null) {
      setPaint((n) => n + 1);
    }
  }, [registry]);

  const onKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    const mod = event.ctrlKey || event.metaKey;
    if (!mod) {
      return;
    }

    const key = event.key.toLowerCase();
    if (key !== "c" && key !== "v") {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    if (key === "c") {
      const selected =
        typeof window !== "undefined"
          ? window.getSelection()?.toString() ?? ""
          : "";
      const text = selected.length > 0 ? selected : SEED_CLIPBOARD_TEXT;
      void clipboardIntegrationBridge
        .copy(text, registry)
        .then(() => {
          setPaint((n) => n + 1);
        })
        .catch(() => {
          // Success Freeze — no Registry.set · no feedback
        });
      return;
    }

    void clipboardIntegrationBridge
      .paste(registry)
      .then(() => {
        setPaint((n) => n + 1);
      })
      .catch(() => {
        // Success Freeze — no Registry.set · no feedback
      });
  };

  return (
    <div
      data-clipboard-host="true"
      tabIndex={0}
      onKeyDown={onKeyDown}
      className="h-full w-full outline-none"
    >
      {children}
    </div>
  );
}

/**
 * ProductCompositionHost
 *   └─ WindowManager
 *       └─ FocusProvider
 *           └─ SelectionProvider
 *               └─ HoverProvider
 *                   └─ KeyboardNavigationProvider
 *                       └─ ClipboardProvider
 *                           └─ InteractionCommandProvider
 *                               ├─ WorkspaceActivationSeed
 *                               ├─ FocusSelectionVisualSeed
 *                               ├─ HoverVisualSeed
 *                               ├─ KeyboardNavigationVisualSeed
 *                               ├─ ClipboardVisualSeed
 *                               └─ KeyboardNavigationDomHost
 *                                   └─ ClipboardDomHost
 *                                       └─ CommandPaletteDomHost
 *                                           └─ UndoRedoDomHost
 *                                               ├─ existing application tree
 *                                               └─ WorkspaceDiagnosticsOverlay
 */
export function ProductCompositionHost({
  children,
}: ProductCompositionHostProps) {
  return (
    <WindowManager>
      <FocusProvider>
        <SelectionProvider>
          <HoverProvider>
            <KeyboardNavigationProvider>
              <ClipboardProvider>
                <InteractionCommandProvider>
                  <WorkspaceActivationSeed />
                  <FocusSelectionVisualSeed />
                  <HoverVisualSeed />
                  <KeyboardNavigationVisualSeed />
                  <ClipboardVisualSeed />
                  <KeyboardNavigationDomHost>
                    <ClipboardDomHost>
                      <CommandPaletteDomHost>
                        <UndoRedoDomHost>
                          {children}
                          <WorkspaceDiagnosticsOverlay />
                        </UndoRedoDomHost>
                      </CommandPaletteDomHost>
                    </ClipboardDomHost>
                  </KeyboardNavigationDomHost>
                </InteractionCommandProvider>
              </ClipboardProvider>
            </KeyboardNavigationProvider>
          </HoverProvider>
        </SelectionProvider>
      </FocusProvider>
    </WindowManager>
  );
}
