"use client";

/**
 * UX-9.1 — ProductCompositionHost.
 *
 * Authorized composition point for the Productivity Layer.
 * Mounts certified WindowManager + FocusProvider only.
 * No new Provider · Context · Registry · Dispatcher · Contract.
 *
 * Smallest Possible Production Integration:
 * Future UX-9 phases extend this host; they never replace it.
 *
 * Activation Seed Freeze:
 * WorkspaceActivationSeed is a temporary integration utility.
 * It MUST NOT become a permanent source of production windows.
 * If product windows already exist → NO-OP.
 */

import { useEffect, useRef, type ReactNode } from "react";
import { FocusProvider } from "@/ui/focus";
import { useWindowContext } from "./WindowContext";
import { useWindowGeometry } from "./WindowGeometryContext";
import { WindowManager } from "./WindowManager";

export type ProductCompositionHostProps = Readonly<{
  children: ReactNode;
}>;

const SEED_WINDOW_A = "ux-9.1-seed-a";
const SEED_WINDOW_B = "ux-9.1-seed-b";

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
 * ProductCompositionHost
 *   └─ WindowManager
 *       └─ FocusProvider
 *           └─ existing application tree
 */
export function ProductCompositionHost({
  children,
}: ProductCompositionHostProps) {
  return (
    <WindowManager>
      <FocusProvider>
        <WorkspaceActivationSeed />
        {children}
      </FocusProvider>
    </WindowManager>
  );
}
