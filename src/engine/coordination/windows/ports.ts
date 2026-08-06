/**
 * ENGINE Domain — Windows coordination ports (injectable; no React).
 * OWNERSHIP: ENGINE defines ports; Windows (Platform) may fulfill later.
 * Prefer injectable fakes — do not import WindowManager (React) from ENGINE.
 */

import type {
  WindowsDocumentNotifyInput,
  WindowsNotifyResult,
} from "./types";

/**
 * Windows notification port — document activation hints only.
 * Does not own WindowRegistry / WindowManager.
 */
export type WindowsPort = {
  notifyDocumentActivated(
    input: WindowsDocumentNotifyInput,
  ): WindowsNotifyResult | Promise<WindowsNotifyResult>;
  notifyDocumentDeactivated(
    documentId: string,
  ): WindowsNotifyResult | Promise<WindowsNotifyResult>;
};
