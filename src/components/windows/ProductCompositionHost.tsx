"use client";

/**
 * UX-9.1 — ProductCompositionHost.
 * UX-9.2 — Provider Composition Completion: FocusProvider → SelectionProvider.
 *   FocusSelectionVisualSeed (temporary · Demo Minimality Freeze).
 *
 * Authorized composition point for the Productivity Layer.
 * Mounts certified WindowManager + FocusProvider + SelectionProvider only.
 * No new Provider · Context · Registry · Dispatcher · Contract.
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
 */

import { useEffect, useRef, type ReactNode } from "react";
import { asFocusTargetId, FocusProvider, useFocus } from "@/ui/focus";
import {
  asSelectionContentId,
  asSelectionWindowId,
  SelectionProvider,
  useSelection,
} from "@/ui/selection";
import { useWindowContext } from "./WindowContext";
import { useWindowGeometry } from "./WindowGeometryContext";
import { WindowManager } from "./WindowManager";

export type ProductCompositionHostProps = Readonly<{
  children: ReactNode;
}>;

const SEED_WINDOW_A = "ux-9.1-seed-a";
const SEED_WINDOW_B = "ux-9.1-seed-b";
const SEED_CONTENT = "ux-9.2-seed-content";

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
 * ProductCompositionHost
 *   └─ WindowManager
 *       └─ FocusProvider
 *           └─ SelectionProvider
 *               ├─ WorkspaceActivationSeed
 *               ├─ FocusSelectionVisualSeed
 *               └─ existing application tree
 */
export function ProductCompositionHost({
  children,
}: ProductCompositionHostProps) {
  return (
    <WindowManager>
      <FocusProvider>
        <SelectionProvider>
          <WorkspaceActivationSeed />
          <FocusSelectionVisualSeed />
          {children}
        </SelectionProvider>
      </FocusProvider>
    </WindowManager>
  );
}
