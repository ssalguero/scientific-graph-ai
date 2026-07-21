/**
 * D58.1 — Window Resize System · Window Geometry State.
 * Single geometry authority: { x, y, width, height } (absolute layer coordinates).
 * Storage-agnostic contract — this factory is one allowed backend (Map), not the freeze.
 * Immutable updates: set() always clones; callers must pass new geometry objects.
 * Supersedes D57 WindowPositionStore ({ x, y } only) while keeping public APIs intact.
 * No React. No UI. Not part of WindowAPI / public barrel.
 * Authority: D58.0 Discovery · D57 Drag compatible · D55/D56 API Freeze intact.
 */

/** Absolute layer geometry — SSOT fields for floating windows. */
export type WindowGeometry = {
  x: number;
  y: number;
  width: number;
  height: number;
};

/** D57-compatible projection — position only. */
export type WindowPosition = Pick<WindowGeometry, "x" | "y">;

export type WindowGeometryListener = () => void;

/**
 * WindowGeometryState — frozen authority concept (D58.0).
 * Implementation may vary; this surface is the internal contract.
 */
export type WindowGeometryState = {
  set(id: string, geometry: WindowGeometry): void;
  get(id: string): WindowGeometry | undefined;
  has(id: string): boolean;
  delete(id: string): void;
  clear(): void;
  getAll(): ReadonlyMap<string, WindowGeometry>;
  subscribe(listener: WindowGeometryListener): () => void;
};

export function cloneGeometry(geometry: WindowGeometry): WindowGeometry {
  return {
    x: geometry.x,
    y: geometry.y,
    width: geometry.width,
    height: geometry.height,
  };
}

const DEFAULT_GEOMETRY: WindowGeometry = {
  x: 0,
  y: 0,
  width: 320,
  height: 240,
};

/**
 * Creates an in-memory GeometryState backend (Map).
 * - get / getAll return defensive clones (geometry-immutable-input)
 * - set always stores a clone of the input
 */
export function createWindowGeometryState(): WindowGeometryState {
  const entries = new Map<string, WindowGeometry>();
  const listeners = new Set<WindowGeometryListener>();

  const notify = (): void => {
    for (const listener of listeners) {
      listener();
    }
  };

  return {
    set(id: string, geometry: WindowGeometry): void {
      entries.set(id, cloneGeometry(geometry));
      notify();
    },

    get(id: string): WindowGeometry | undefined {
      const entry = entries.get(id);
      return entry === undefined ? undefined : cloneGeometry(entry);
    },

    has(id: string): boolean {
      return entries.has(id);
    },

    delete(id: string): void {
      if (!entries.delete(id)) {
        return;
      }
      notify();
    },

    clear(): void {
      if (entries.size === 0) {
        return;
      }
      entries.clear();
      notify();
    },

    getAll(): ReadonlyMap<string, WindowGeometry> {
      const snapshot = new Map<string, WindowGeometry>();
      for (const [id, geometry] of entries) {
        snapshot.set(id, cloneGeometry(geometry));
      }
      return snapshot;
    },

    subscribe(listener: WindowGeometryListener): () => void {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}

/** Seeds default geometry when a window id has none yet. */
export function ensureDefaultGeometry(
  state: WindowGeometryState,
  id: string
): void {
  if (!state.has(id)) {
    state.set(id, DEFAULT_GEOMETRY);
  }
}
