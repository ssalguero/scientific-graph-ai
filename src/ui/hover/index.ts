/**
 * UX-8.4 — Hover System local barrel.
 * Not re-exported from @/ui (src/ui/index.ts) in this phase.
 */

export type {
  HoverWindowId,
  HoverContentId,
  HoverSeriesId,
} from "./HoverTypes";
export {
  asHoverWindowId,
  asHoverContentId,
  asHoverSeriesId,
} from "./HoverTypes";

export type { HoverState, HoverStateInit } from "./HoverState";
export { createHoverState, EMPTY_HOVER_STATE } from "./HoverState";

export type { HoverRegistryApi } from "./HoverRegistry";
export { createHoverRegistry, hoverRegistry } from "./HoverRegistry";

export type { HoverContextValue } from "./HoverContext";
export { HoverContext } from "./HoverContext";

export type { HoverProviderProps } from "./HoverProvider";
export { HoverProvider } from "./HoverProvider";

export { useHover } from "./useHover";
