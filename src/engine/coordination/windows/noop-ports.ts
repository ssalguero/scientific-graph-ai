/**
 * ENGINE Domain — No-op Windows ports (safe defaults for Node tests / unwired app).
 */

import type { WindowsPort } from "./ports";
import type { WindowsNotifyResult } from "./types";

export function createNoOpWindowsPort(): WindowsPort {
  return {
    notifyDocumentActivated(): WindowsNotifyResult {
      return { notified: false };
    },
    notifyDocumentDeactivated(): WindowsNotifyResult {
      return { notified: false };
    },
  };
}
