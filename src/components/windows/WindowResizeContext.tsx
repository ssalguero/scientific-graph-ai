"use client";

/**
 * D58.2 — Window Resize System · WindowResize context shell.
 * Exposes WindowResizeAPI to FloatingWindow resize handles.
 * Separate from WindowContext / WindowDragContext.
 * Not barrel-exported. No presentation.
 * Authority: D58.0 Discovery · D58.2 Resize Handles.
 */

import { createContext, useContext, type ReactNode } from "react";
import type { WindowResizeAPI } from "./WindowResizeBridge";

const NOOP_WINDOW_RESIZE_API: WindowResizeAPI = {
  beginResize() {
    /* no-op outside provider */
  },
  updateResize() {
    /* no-op outside provider */
  },
  endResize() {
    /* no-op outside provider */
  },
};

export const WindowResizeContext =
  createContext<WindowResizeAPI>(NOOP_WINDOW_RESIZE_API);

export type WindowResizeProviderProps = {
  children?: ReactNode;
  value?: WindowResizeAPI;
};

export function WindowResizeProvider({
  children,
  value,
}: WindowResizeProviderProps) {
  return (
    <WindowResizeContext.Provider value={value ?? NOOP_WINDOW_RESIZE_API}>
      {children}
    </WindowResizeContext.Provider>
  );
}

/** Certified D58.2 hook — ResizeHandle → WindowResizeBridge only. */
export function useWindowResize(): WindowResizeAPI {
  return useContext(WindowResizeContext);
}
