/**
 * D55.2 — Multi-Window Foundation · public barrel (API Freeze).
 * Exports only the frozen public surface.
 * Authority: docs/D55.1-multi-window-discovery.md
 */

export type {
  WindowDefinition,
  WindowState,
  WindowHandle,
  WindowEventType,
  WindowEvent,
  WindowAPI,
} from "./WindowTypes";

export { createWindowRegistry } from "./WindowRegistry";

export { WindowProvider, useWindowContext } from "./WindowContext";
export { WindowManager } from "./WindowManager";
