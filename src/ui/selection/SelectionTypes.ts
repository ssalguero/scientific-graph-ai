/**
 * UX-8.2 — Selection System foundation types.
 * Branded selection identities — no React · no WindowRegistry · no Focus.
 *
 * IDs are branded strings only. No WindowTypes import.
 */

export type SelectionWindowId = string & {
  readonly __brand: "SelectionWindowId";
};

export type SelectionContentId = string & {
  readonly __brand: "SelectionContentId";
};

export type SelectionSeriesId = string & {
  readonly __brand: "SelectionSeriesId";
};

export function asSelectionWindowId(id: string): SelectionWindowId {
  return id as SelectionWindowId;
}

export function asSelectionContentId(id: string): SelectionContentId {
  return id as SelectionContentId;
}

export function asSelectionSeriesId(id: string): SelectionSeriesId {
  return id as SelectionSeriesId;
}
