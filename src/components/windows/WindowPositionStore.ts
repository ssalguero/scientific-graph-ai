/**
 * D57.1 — Window Drag System · Window Position Store.
 * D57.4 — subscribe() for reactive Bridge Mapping (revision ticks only; store remains SSOT).
 * Parallel SSOT for window geometry (x/y only). Independent of WindowState / lifecycle.
 * Absolute coordinates in the window layer coordinate system (D57 Coordinate Space Freeze).
 * No React. No UI. No public WindowAPI surface.
 * Authority: D57.0 Window Drag System Discovery · D55/D56 API Freeze intact.
 */

/** Absolute layer coordinates — x/y only. Does not own width, height, or zIndex. */
export type WindowPosition = {
  x: number;
  y: number;
};

export type WindowPositionListener = () => void;

/** Internal store surface — not part of WindowAPI / public barrel. */
export type WindowPositionStore = {
  set(id: string, position: WindowPosition): void;
  get(id: string): WindowPosition | undefined;
  has(id: string): boolean;
  delete(id: string): void;
  clear(): void;
  getAll(): ReadonlyMap<string, WindowPosition>;
  /** Notify listeners after mutations — used for Bridge re-render ticks. */
  subscribe(listener: WindowPositionListener): () => void;
};

function clonePosition(position: WindowPosition): WindowPosition {
  return { x: position.x, y: position.y };
}

const DEFAULT_POSITION: WindowPosition = { x: 0, y: 0 };

/**
 * Creates an isolated in-memory position store.
 * - Map<WindowId, { x, y }> storage
 * - get / getAll return defensive copies (no live mutable refs)
 * - delete / clear are safe for missing ids
 * - subscribe notifies after set / delete / clear
 */
export function createWindowPositionStore(): WindowPositionStore {
  const entries = new Map<string, WindowPosition>();
  const listeners = new Set<WindowPositionListener>();

  const notify = (): void => {
    for (const listener of listeners) {
      listener();
    }
  };

  return {
    set(id: string, position: WindowPosition): void {
      entries.set(id, clonePosition(position));
      notify();
    },

    get(id: string): WindowPosition | undefined {
      const entry = entries.get(id);
      return entry === undefined ? undefined : clonePosition(entry);
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

    getAll(): ReadonlyMap<string, WindowPosition> {
      const snapshot = new Map<string, WindowPosition>();
      for (const [id, position] of entries) {
        snapshot.set(id, clonePosition(position));
      }
      return snapshot;
    },

    subscribe(listener: WindowPositionListener): () => void {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}

/** Seeds a default layer origin when a window id has no position yet. */
export function ensureDefaultPosition(
  store: WindowPositionStore,
  id: string
): void {
  if (!store.has(id)) {
    store.set(id, DEFAULT_POSITION);
  }
}
