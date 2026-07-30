/** UX-2.9 — Panel resize barrel (frozen public surface). */

export { PanelResizeHandle } from "./PanelResizeHandle";
export type { PanelResizeHandleProps } from "./PanelResizeHandle";
export { PanelResizeProvider } from "./PanelResizeProvider";
export type { PanelResizeProviderProps } from "./PanelResizeProvider";
export { PanelResizeContext } from "./PanelResizeContext";
export type { PanelResizeContextValue } from "./PanelResizeContext";
export { usePanelResize } from "./usePanelResize";
export type {
  ResizeAxis,
  ResizeSession,
  ResizeConstraintSet,
} from "./ResizeTypes";
export {
  clamp,
  delta,
  applyLimits,
  computeNextSize,
  snap,
} from "./ResizeMath";
export {
  MIN_LEFT,
  MAX_LEFT,
  MIN_RIGHT,
  MAX_RIGHT,
  MIN_BOTTOM,
  MAX_BOTTOM,
  HANDLE_SIZE,
  RESIZE_CONSTRAINTS,
} from "./ResizeConstraints";
