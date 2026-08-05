/**
 * UX-8.4 — Hover System foundation types.
 * Branded hover identities — no React · no WindowRegistry · no Focus · no Selection.
 *
 * IDs are branded strings only. No WindowTypes import.
 */

export type HoverWindowId = string & {
  readonly __brand: "HoverWindowId";
};

export type HoverContentId = string & {
  readonly __brand: "HoverContentId";
};

export type HoverSeriesId = string & {
  readonly __brand: "HoverSeriesId";
};

export function asHoverWindowId(id: string): HoverWindowId {
  return id as HoverWindowId;
}

export function asHoverContentId(id: string): HoverContentId {
  return id as HoverContentId;
}

export function asHoverSeriesId(id: string): HoverSeriesId {
  return id as HoverSeriesId;
}
