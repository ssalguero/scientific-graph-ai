/**
 * ENGINE Domain — No-op Runtime ports (safe defaults for Node tests / unwired app).
 */

import type { RuntimePort } from "./ports";
import type { RuntimeNotifyResult } from "./types";

export function createNoOpRuntimePort(): RuntimePort {
  return {
    notifyInitialized(): RuntimeNotifyResult {
      return { notified: false };
    },
    notifyShutdown(): RuntimeNotifyResult {
      return { notified: false };
    },
  };
}
