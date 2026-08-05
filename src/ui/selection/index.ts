/**
 * UX-8.3 — Selection System local barrel.
 * Not re-exported from @/ui (src/ui/index.ts) in this phase.
 */

export type {
  SelectionWindowId,
  SelectionContentId,
  SelectionSeriesId,
} from "./SelectionTypes";
export {
  asSelectionWindowId,
  asSelectionContentId,
  asSelectionSeriesId,
} from "./SelectionTypes";

export type { SelectionSet } from "./SelectionSet";
export { createSelectionSet, EMPTY_SELECTION_SET } from "./SelectionSet";

export type { SelectionState, SelectionStateInit } from "./SelectionState";
export { createSelectionState, EMPTY_SELECTION_STATE } from "./SelectionState";

export type { SelectionRegistryApi } from "./SelectionRegistry";
export { createSelectionRegistry, selectionRegistry } from "./SelectionRegistry";

export type { SelectionContextValue } from "./SelectionContext";
export { SelectionContext } from "./SelectionContext";

export type { SelectionProviderProps } from "./SelectionProvider";
export { SelectionProvider } from "./SelectionProvider";

export { useSelection } from "./useSelection";
