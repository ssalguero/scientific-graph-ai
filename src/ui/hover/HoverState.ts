/**
 * UX-8.4 — Immutable HoverState snapshot.
 *
 * Only hoveredWindowId + hoveredContentId + hoveredSeriesId.
 * Hover Semantics Freeze: current state only — no history, no enter/leave,
 * no coordinates. Axes are completely independent — mixed nulls are valid.
 *
 * No arrays · no Set · no Map · no metadata · no timestamps · no ownership.
 */

import type {
  HoverContentId,
  HoverSeriesId,
  HoverWindowId,
} from "./HoverTypes";

export type HoverState = Readonly<{
  readonly hoveredWindowId: HoverWindowId | null;
  readonly hoveredContentId: HoverContentId | null;
  readonly hoveredSeriesId: HoverSeriesId | null;
}>;

/** Input shape for createHoverState (freeze-only). */
export type HoverStateInit = Readonly<{
  hoveredWindowId: HoverWindowId | null;
  hoveredContentId: HoverContentId | null;
  hoveredSeriesId: HoverSeriesId | null;
}>;

/**
 * Builds an immutable HoverState snapshot.
 * Applies Object.freeze only — no collections.
 */
export function createHoverState(init: HoverStateInit): HoverState {
  return Object.freeze({
    hoveredWindowId: init.hoveredWindowId,
    hoveredContentId: init.hoveredContentId,
    hoveredSeriesId: init.hoveredSeriesId,
  });
}

/** Empty hover snapshot (nothing hovered on any axis). */
export const EMPTY_HOVER_STATE: HoverState = createHoverState({
  hoveredWindowId: null,
  hoveredContentId: null,
  hoveredSeriesId: null,
});
