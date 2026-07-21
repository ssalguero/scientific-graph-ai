"use client";

/**
 * D57.3 — Window Drag System · WindowDrag context shell.
 * Exposes WindowDragAPI (beginDrag / updateDrag / endDrag) to FloatingWindow title bar.
 * Separate from WindowContext — FloatingWindow must not call useWindowContext.
 * Not barrel-exported. No presentation.
 * Authority: D57.0 Discovery · D57.2 WindowDragBridge · D55/D56 public API Freeze intact.
 */

import { createContext, useContext, type ReactNode } from "react";
import type { WindowDragAPI } from "./WindowDragBridge";

const NOOP_WINDOW_DRAG_API: WindowDragAPI = {
  beginDrag() {
    /* no-op outside provider */
  },
  updateDrag() {
    /* no-op outside provider */
  },
  endDrag() {
    /* no-op outside provider */
  },
};

export const WindowDragContext =
  createContext<WindowDragAPI>(NOOP_WINDOW_DRAG_API);

export type WindowDragProviderProps = {
  children?: ReactNode;
  value?: WindowDragAPI;
};

export function WindowDragProvider({
  children,
  value,
}: WindowDragProviderProps) {
  return (
    <WindowDragContext.Provider value={value ?? NOOP_WINDOW_DRAG_API}>
      {children}
    </WindowDragContext.Provider>
  );
}

/** Certified D57 hook — TitleBar → WindowDragBridge only. */
export function useWindowDrag(): WindowDragAPI {
  return useContext(WindowDragContext);
}
