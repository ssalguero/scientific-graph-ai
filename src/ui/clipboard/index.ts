/**
 * UX-8.6 — Clipboard local barrel.
 * Not re-exported from @/ui (src/ui/index.ts) in this phase.
 */

export type { ClipboardEntry } from "./ClipboardTypes";

export type { ClipboardState, ClipboardStateInit } from "./ClipboardState";
export {
  createClipboardState,
  EMPTY_CLIPBOARD_STATE,
} from "./ClipboardState";

export type { ClipboardRegistryApi } from "./ClipboardRegistry";
export {
  createClipboardRegistry,
  clipboardRegistry,
} from "./ClipboardRegistry";

export type { ClipboardContextValue } from "./ClipboardContext";
export { ClipboardContext } from "./ClipboardContext";

export type { ClipboardProviderProps } from "./ClipboardProvider";
export { ClipboardProvider } from "./ClipboardProvider";

export { useClipboard } from "./useClipboard";
