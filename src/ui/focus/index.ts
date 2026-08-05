/**
 * UX-8.1 — Focus System local barrel.
 * Not re-exported from @/ui (src/ui/index.ts) in this phase.
 */

export type { FocusTargetId } from "./FocusTypes";
export { asFocusTargetId } from "./FocusTypes";

export type { FocusState, FocusStateInit } from "./FocusState";
export { createFocusState, EMPTY_FOCUS_STATE } from "./FocusState";

export type { FocusRegistryApi } from "./FocusRegistry";
export { createFocusRegistry, focusRegistry } from "./FocusRegistry";

export type { FocusContextValue } from "./FocusContext";
export { FocusContext } from "./FocusContext";

export type { FocusProviderProps } from "./FocusProvider";
export { FocusProvider } from "./FocusProvider";

export { useFocus } from "./useFocus";
