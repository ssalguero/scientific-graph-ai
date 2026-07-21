"use client";

/**
 * D55.3 — Multi-Window Foundation · Window Manager.
 * D57.1 — Hosts parallel WindowPositionStore (geometry SSOT; not on WindowAPI).
 * D57.2 — Hosts WindowDragBridge (internal session → Position Store; not on WindowAPI).
 * Single WindowRegistry · single WindowState source of truth · full WindowAPI.
 * Lifecycle: create (registers) → register → activate → focus → minimize → restore → close.
 * Renders only WindowProvider around children — zero visual chrome.
 * Authority: docs/D55.1-multi-window-discovery.md · D55.2 API Freeze (unchanged) · D57.0 Discovery.
 */

import { useMemo, useRef, useState, type ReactNode } from "react";
import {
  WindowProvider,
  type WindowContextValue,
} from "./WindowContext";
import { createWindowDragBridge } from "./WindowDragBridge";
import {
  createWindowPositionStore,
  ensureDefaultPosition,
} from "./WindowPositionStore";
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

function normalizeDefinition(definition: WindowDefinition): WindowDefinition {
  const next: WindowDefinition = {
    id: definition.id,
    title: definition.title,
    visible: definition.visible,
  };
  if (definition.dockId !== undefined) {
    next.dockId = definition.dockId;
  }
  if (definition.metadata !== undefined) {
    next.metadata = { ...definition.metadata };
  }
  return next;
}

function cloneState(prev: WindowState): WindowState {
  return {
    windows: new Map(prev.windows),
    minimizedIds: new Set(prev.minimizedIds),
    ...(prev.activeId !== undefined ? { activeId: prev.activeId } : {}),
    ...(prev.focusedId !== undefined ? { focusedId: prev.focusedId } : {}),
  };
}

function clearWindowRefs(state: WindowState, id: string): void {
  state.windows.delete(id);
  state.minimizedIds.delete(id);
  if (state.activeId === id) {
    delete state.activeId;
  }
  if (state.focusedId === id) {
    delete state.focusedId;
  }
}

function snapshotState(state: WindowState): WindowState {
  return cloneState(state);
}

/**
 * Autocontained manager: registry + state + position store + WindowDragBridge → Provider.
 * Geometry / session infra are internal — never exposed on WindowAPI / WindowState.
 */
export function WindowManager({ children }: WindowManagerProps) {
  const registryRef = useRef(createWindowRegistry());
  const registry = registryRef.current;

  const positionStoreRef = useRef(createWindowPositionStore());
  const positionStore = positionStoreRef.current;

  const windowDragBridgeRef = useRef(createWindowDragBridge(positionStore));
  const windowDragBridge = windowDragBridgeRef.current;

  const [state, setState] = useState<WindowState>(createEmptyWindowState);

  const api = useMemo<WindowAPI>(
    () => ({
      /**
       * create — builds a valid definition and registers it.
       * Duplicate id is a no-op (returns existing handle).
       */
      create(definition: WindowDefinition) {
        const normalized = normalizeDefinition(definition);
        if (registry.has(normalized.id)) {
          return { id: normalized.id };
        }
        registry.register(normalized);
        ensureDefaultPosition(positionStore, normalized.id);
        setState((prev) => {
          const next = cloneState(prev);
          next.windows.set(normalized.id, normalizeDefinition(normalized));
          return next;
        });
        return { id: normalized.id };
      },

      /**
       * register — adds an existing window definition to the registry + state.
       * Duplicate registry id is a no-op at registry layer; state stays in sync.
       */
      register(definition: WindowDefinition) {
        const normalized = normalizeDefinition(definition);
        registry.register(normalized);
        ensureDefaultPosition(positionStore, normalized.id);
        setState((prev) => {
          if (prev.windows.has(normalized.id)) {
            return prev;
          }
          const next = cloneState(prev);
          next.windows.set(normalized.id, normalizeDefinition(normalized));
          return next;
        });
      },

      unregister(id: string) {
        const session = windowDragBridge.getState();
        if (session.status === "dragging" && session.id === id) {
          windowDragBridge.endDrag();
        }
        registry.unregister(id);
        positionStore.delete(id);
        setState((prev) => {
          if (!prev.windows.has(id) && prev.activeId !== id && prev.focusedId !== id && !prev.minimizedIds.has(id)) {
            return prev;
          }
          const next = cloneState(prev);
          clearWindowRefs(next, id);
          return next;
        });
      },

      activate(id: string) {
        setState((prev) => {
          if (!prev.windows.has(id) && !registry.has(id)) {
            return prev;
          }
          if (prev.activeId === id) {
            return prev;
          }
          const next = cloneState(prev);
          next.activeId = id;
          return next;
        });
      },

      focus(id: string) {
        setState((prev) => {
          if (!prev.windows.has(id) && !registry.has(id)) {
            return prev;
          }
          if (prev.focusedId === id) {
            return prev;
          }
          const next = cloneState(prev);
          next.focusedId = id;
          return next;
        });
      },

      minimize(id: string) {
        setState((prev) => {
          if (!prev.windows.has(id) && !registry.has(id)) {
            return prev;
          }
          if (prev.minimizedIds.has(id)) {
            return prev;
          }
          const next = cloneState(prev);
          next.minimizedIds.add(id);
          return next;
        });
      },

      restore(id: string) {
        setState((prev) => {
          if (!prev.minimizedIds.has(id)) {
            return prev;
          }
          const next = cloneState(prev);
          next.minimizedIds.delete(id);
          return next;
        });
      },

      /**
       * close — removes from registry and clears activeId / focusedId / minimizedIds.
       */
      close(id: string) {
        const session = windowDragBridge.getState();
        if (session.status === "dragging" && session.id === id) {
          windowDragBridge.endDrag();
        }
        registry.unregister(id);
        positionStore.delete(id);
        setState((prev) => {
          if (!prev.windows.has(id) && prev.activeId !== id && prev.focusedId !== id && !prev.minimizedIds.has(id)) {
            return prev;
          }
          const next = cloneState(prev);
          clearWindowRefs(next, id);
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
    [registry, positionStore, windowDragBridge]
  );

  const value = useMemo<WindowContextValue>(
    () => ({
      state: snapshotState(state),
      api,
    }),
    [state, api]
  );

  return <WindowProvider value={value}>{children}</WindowProvider>;
}
