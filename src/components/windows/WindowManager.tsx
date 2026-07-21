"use client";

/**
 * D55.3 — Multi-Window Foundation · Window Manager.
 * D57 — Hosts DragBridge + geometry providers (not on WindowAPI).
 * D58.1 — Hosts WindowGeometryState + WindowResizeBridge.
 * D58.2 — Provides WindowResizeAPI + drag XOR resize session exclusivity.
 * D58.3 — ResizeBridge uses GeometryConstraints + WorkspaceConstraints defaults.
 * D59.2 — Injects SnapConfig + SnapTargetProviders into DragBridge.
 * D59.3 — Injects same Snap composition into ResizeBridge (post-constraints).
 * Lifecycle: create → register → activate → focus → minimize → restore → close.
 * Renders providers only — zero visual chrome.
 * Authority: D55.1 · D57.5 · D58.0 · D59.0 Discovery · D59.2 · D59.3.
 */

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  WindowProvider,
  type WindowContextValue,
} from "./WindowContext";
import { createWindowDragBridge } from "./WindowDragBridge";
import { WindowDragProvider } from "./WindowDragContext";
import {
  DEFAULT_GEOMETRY_CONSTRAINTS,
  DEFAULT_WORKSPACE_CONSTRAINTS,
} from "./WindowGeometryConstraints";
import { WindowGeometryProvider } from "./WindowGeometryContext";
import {
  createWindowGeometryState,
  ensureDefaultGeometry,
  type WindowGeometry,
} from "./WindowGeometryState";
import { createWindowResizeBridge, type WindowResizeEdge } from "./WindowResizeBridge";
import { WindowResizeProvider } from "./WindowResizeContext";
import { createWindowRegistry } from "./WindowRegistry";
import {
  createWorkspaceSnapTargetProvider,
  createWindowSnapTargetProvider,
} from "./WindowSnapTargetProviders";
import { createDefaultSnapConfig } from "./WindowSnapTypes";
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
 * Autocontained manager: registry + state + GeometryState + Drag/Resize bridges.
 * Geometry / session infra are internal — never exposed on WindowAPI / WindowState.
 */
export function WindowManager({ children }: WindowManagerProps) {
  const registryRef = useRef(createWindowRegistry());
  const registry = registryRef.current;

  const geometryStateRef = useRef(createWindowGeometryState());
  const geometryState = geometryStateRef.current;

  /** Live minimized set for snap source filtering (composer — not Engine). */
  const minimizedIdsRef = useRef<ReadonlySet<string>>(new Set());

  const snapConfigRef = useRef(createDefaultSnapConfig());
  const snapProvidersRef = useRef([
    createWorkspaceSnapTargetProvider(),
    createWindowSnapTargetProvider(),
  ]);

  const getSnapGeometries = (): ReadonlyMap<string, WindowGeometry> => {
    const all = geometryState.getAll();
    const minimized = minimizedIdsRef.current;
    if (minimized.size === 0) {
      return all;
    }
    const filtered = new Map<string, WindowGeometry>();
    for (const [id, geometry] of all) {
      if (!minimized.has(id)) {
        filtered.set(id, geometry);
      }
    }
    return filtered;
  };

  const windowDragBridgeRef = useRef(
    createWindowDragBridge(geometryState, {
      snap: {
        config: snapConfigRef.current,
        providers: snapProvidersRef.current,
        workspace: DEFAULT_WORKSPACE_CONSTRAINTS,
        getGeometries: getSnapGeometries,
      },
    })
  );
  const windowDragBridge = windowDragBridgeRef.current;

  const windowResizeBridgeRef = useRef(
    createWindowResizeBridge(geometryState, {
      geometryConstraints: DEFAULT_GEOMETRY_CONSTRAINTS,
      workspaceConstraints: DEFAULT_WORKSPACE_CONSTRAINTS,
      snap: {
        config: snapConfigRef.current,
        providers: snapProvidersRef.current,
        workspace: DEFAULT_WORKSPACE_CONSTRAINTS,
        getGeometries: getSnapGeometries,
      },
    })
  );
  const windowResizeBridge = windowResizeBridgeRef.current;

  const [state, setState] = useState<WindowState>(createEmptyWindowState);
  const [geometryRevision, setGeometryRevision] = useState(0);

  minimizedIdsRef.current = state.minimizedIds;

  useEffect(() => {
    return geometryState.subscribe(() => {
      setGeometryRevision((prev) => prev + 1);
    });
  }, [geometryState]);

  const api = useMemo<WindowAPI>(
    () => ({
      create(definition: WindowDefinition) {
        const normalized = normalizeDefinition(definition);
        if (registry.has(normalized.id)) {
          return { id: normalized.id };
        }
        registry.register(normalized);
        ensureDefaultGeometry(geometryState, normalized.id);
        setState((prev) => {
          const next = cloneState(prev);
          next.windows.set(normalized.id, normalizeDefinition(normalized));
          return next;
        });
        return { id: normalized.id };
      },

      register(definition: WindowDefinition) {
        const normalized = normalizeDefinition(definition);
        registry.register(normalized);
        ensureDefaultGeometry(geometryState, normalized.id);
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
        const dragSession = windowDragBridge.getState();
        if (dragSession.status === "dragging" && dragSession.id === id) {
          windowDragBridge.endDrag();
        }
        const resizeSession = windowResizeBridge.getState();
        if (resizeSession.status === "resizing" && resizeSession.id === id) {
          windowResizeBridge.endResize();
        }
        registry.unregister(id);
        geometryState.delete(id);
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

      close(id: string) {
        const dragSession = windowDragBridge.getState();
        if (dragSession.status === "dragging" && dragSession.id === id) {
          windowDragBridge.endDrag();
        }
        const resizeSession = windowResizeBridge.getState();
        if (resizeSession.status === "resizing" && resizeSession.id === id) {
          windowResizeBridge.endResize();
        }
        registry.unregister(id);
        geometryState.delete(id);
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
    [registry, geometryState, windowDragBridge, windowResizeBridge]
  );

  const value = useMemo<WindowContextValue>(
    () => ({
      state: snapshotState(state),
      api,
    }),
    [state, api]
  );

  const windowDragApi = useMemo(
    () => ({
      beginDrag(id: string, x: number, y: number) {
        windowResizeBridge.endResize();
        windowDragBridge.beginDrag(id, x, y);
      },
      updateDrag: windowDragBridge.updateDrag,
      endDrag: windowDragBridge.endDrag,
    }),
    [windowDragBridge, windowResizeBridge]
  );

  const windowResizeApi = useMemo(
    () => ({
      beginResize(
        id: string,
        edge: WindowResizeEdge,
        pointerX: number,
        pointerY: number
      ) {
        windowDragBridge.endDrag();
        windowResizeBridge.beginResize(id, edge, pointerX, pointerY);
      },
      updateResize: windowResizeBridge.updateResize,
      endResize: windowResizeBridge.endResize,
    }),
    [windowDragBridge, windowResizeBridge]
  );

  const geometryValue = useMemo(
    () => ({
      geometryState,
      revision: geometryRevision,
    }),
    [geometryState, geometryRevision]
  );

  return (
    <WindowProvider value={value}>
      <WindowGeometryProvider value={geometryValue}>
        <WindowDragProvider value={windowDragApi}>
          <WindowResizeProvider value={windowResizeApi}>
            {children}
          </WindowResizeProvider>
        </WindowDragProvider>
      </WindowGeometryProvider>
    </WindowProvider>
  );
}
