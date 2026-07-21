/**
 * D55.2 — Multi-Window Foundation · public type contracts (API Freeze).
 * Authority: docs/D55.1-multi-window-discovery.md
 */

/** Frozen public API — D55.1 Multi-Window API Freeze. */
export interface WindowDefinition {
  id: string;
  title: string;
  dockId?: string;
  visible: boolean;
  metadata?: Record<string, unknown>;
}

/** Frozen public API — D55.1 Multi-Window API Freeze. */
export interface WindowState {
  windows: Map<string, WindowDefinition>;
  activeId?: string;
  focusedId?: string;
  minimizedIds: Set<string>;
}

/** Frozen public API — D55.1 Multi-Window API Freeze. Minimal handle. */
export interface WindowHandle {
  id: string;
}

/** Frozen public API — D55.1 Multi-Window API Freeze. Closed lifecycle event set. */
export type WindowEventType =
  | "create"
  | "register"
  | "activate"
  | "focus"
  | "minimize"
  | "restore"
  | "close";

/** Frozen public API — D55.1 Multi-Window API Freeze. */
export interface WindowEvent {
  type: WindowEventType;
  windowId: string;
}

/**
 * Frozen public API — D55.1 Multi-Window API Freeze.
 * Exact method surface — no additional methods.
 */
export interface WindowAPI {
  create(definition: WindowDefinition): WindowHandle;
  register(definition: WindowDefinition): void;
  unregister(id: string): void;
  activate(id: string): void;
  focus(id: string): void;
  minimize(id: string): void;
  restore(id: string): void;
  close(id: string): void;
  get(id: string): WindowDefinition | undefined;
  getAll(): readonly WindowDefinition[];
}

/** Empty initial state helper — not part of the public barrel. */
export function createEmptyWindowState(): WindowState {
  return {
    windows: new Map(),
    minimizedIds: new Set(),
  };
}
