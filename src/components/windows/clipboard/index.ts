/**
 * UX-9.5 — Clipboard Integration local barrel.
 * Outside src/ui/clipboard (Clipboard Module Purity Freeze).
 */

export type { BrowserClipboardAdapter } from "./BrowserClipboardAdapter";
export { createBrowserClipboardAdapter } from "./BrowserClipboardAdapter";

export type {
  ClipboardFeedbackKind,
  ClipboardFeedbackSnapshot,
  ClipboardIntegrationBridge,
} from "./ClipboardIntegrationBridge";
export {
  clipboardIntegrationBridge,
  createClipboardIntegrationBridge,
  getClipboardFeedback,
  subscribeClipboardFeedback,
} from "./ClipboardIntegrationBridge";
