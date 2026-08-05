/**
 * UX-8.5 — Keyboard Navigation local barrel.
 * Not re-exported from @/ui (src/ui/index.ts) in this phase.
 */

export { KeyboardNavigationDirection } from "./KeyboardNavigationTypes";

export type {
  KeyboardNavigationState,
  KeyboardNavigationStateInit,
} from "./KeyboardNavigationState";
export {
  createKeyboardNavigationState,
  EMPTY_KEYBOARD_NAVIGATION_STATE,
} from "./KeyboardNavigationState";

export type { KeyboardNavigationRegistryApi } from "./KeyboardNavigationRegistry";
export {
  createKeyboardNavigationRegistry,
  keyboardNavigationRegistry,
} from "./KeyboardNavigationRegistry";

export type { KeyboardNavigationContextValue } from "./KeyboardNavigationContext";
export { KeyboardNavigationContext } from "./KeyboardNavigationContext";

export type { KeyboardNavigationProviderProps } from "./KeyboardNavigationProvider";
export { KeyboardNavigationProvider } from "./KeyboardNavigationProvider";

export { useKeyboardNavigation } from "./useKeyboardNavigation";
