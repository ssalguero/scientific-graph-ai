"use client";

/**
 * D55.2 — Multi-Window Foundation · Window Manager.
 * Owns WindowState, WindowRegistry, and WindowAPI. Provides Context.
 * No window rendering, overlays, portals, or floating UI.
 * Authority: docs/D55.1-multi-window-discovery.md
 */

import { useMemo, useRef, useState, type ReactNode } from "react";
import {
  WindowProvider,
  type WindowContextValue,
} from "./WindowContext";
import { createWindowRegistry } from "./WindowRegistry";
import {
  createEmptyWindowState,
  type WindowAPI,
  type WindowDefinition,
  type WindowState,
} from "./WindowTypes";

export type WindowManagerProps = {
  children?: ReactNode;
};

function cloneState(prev: WindowState): {
  windows: Map<string, WindowDefinition>;
  minimizedIds: Set<string>;
  activeId?: string;
  focusedId?: string;
} {
  return {
    windows: new Map(prev.windows),
    minimizedIds: new Set(prev.minimizedIds),
    activeId: prev.activeId,
    focusedId: prev.focusedId,
  };
}

/**
 * Autocontained manager: registry + lifecycle state + WindowAPI.
 * Renders only WindowProvider around children — zero visual chrome.
 */
export function WindowManager({ children }: WindowManagerProps) {
  const registryRef = useRef(createWindowRegistry());
  const registry = registryRef.current;

  const [state, setState] = useState<WindowState>(createEmptyWindowState);

  const api = useMemo<WindowAPI>(
    () => ({
      create(definition: WindowDefinition) {
        setState((prev) => {
          const next = cloneState(prev);
          next.windows.set(definition.id, definition);
          return next;
        });
        return { id: definition.id };
      },

      register(definition: WindowDefinition) {
        registry.register(definition);
        setState((prev) => {
          const next = cloneState(prev);
          next.windows.set(definition.id, definition);
          return next;
        });
      },

      unregister(id: string) {
        registry.unregister(id);
        setState((prev) => {
          const next = cloneState(prev);
          next.windows.delete(id);
          next.minimizedIds.delete(id);
          if (next.activeId === id) {
            delete next.activeId;
          }
          if (next.focusedId === id) {
            delete next.focusedId;
          }
          return next;
        });
      },

      activate(id: string) {
        setState((prev) => {
          const next = cloneState(prev);
          next.activeId = id;
          return next;
        });
      },

      focus(id: string) {
        setState((prev) => {
          const next = cloneState(prev);
          next.focusedId = id;
          return next;
        });
      },

      minimize(id: string) {
        setState((prev) => {
          const next = cloneState(prev);
          next.minimizedIds.add(id);
          return next;
        });
      },

      restore(id: string) {
        setState((prev) => {
          const next = cloneState(prev);
          next.minimizedIds.delete(id);
          return next;
        });
      },

      close(id: string) {
        registry.unregister(id);
        setState((prev) => {
          const next = cloneState(prev);
          next.windows.delete(id);
          next.minimizedIds.delete(id);
          if (next.activeId === id) {
            delete next.activeId;
          }
          if (next.focusedId === id) {
            delete next.focusedId;
          }
          return next;
        });
      },

      get(id: string) {
        return registry.get(id);
      },

      getAll() {
        return registry.getAll();
      },
    }),
    [registry]
  );

  const value = useMemo<WindowContextValue>(
    () => ({
      state,
      api,
    }),
    [state, api]
  );

  return <WindowProvider value={value}>{children}</WindowProvider>;
}
