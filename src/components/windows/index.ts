/**
 * D55.2 — Multi-Window Foundation · public barrel (API Freeze).
 * D56.1 — Floating Window Model types appended (types only).
 * Authority: docs/D55.1-multi-window-discovery.md · D56 Floating Windows API Freeze
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

export * from "./FloatingWindowTypes";
