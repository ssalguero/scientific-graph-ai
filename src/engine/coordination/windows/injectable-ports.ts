/**
 * ENGINE Domain — Injectable Windows port wrappers (fakes / future Platform adapters).
 */

import type { WindowsPort } from "./ports";
import type {
  WindowsDocumentNotifyInput,
  WindowsNotifyResult,
} from "./types";

export type InjectableWindowsHooks = {
  onDocumentActivated?(
    input: WindowsDocumentNotifyInput,
  ): void | WindowsNotifyResult | Promise<void | WindowsNotifyResult>;
  onDocumentDeactivated?(
    documentId: string,
  ): void | WindowsNotifyResult | Promise<void | WindowsNotifyResult>;
};

export function createInjectableWindowsPort(
  hooks: InjectableWindowsHooks | null | undefined,
): WindowsPort {
  return {
    async notifyDocumentActivated(input): Promise<WindowsNotifyResult> {
      if (!hooks?.onDocumentActivated) return { notified: false };
      const result = await hooks.onDocumentActivated(input);
      if (result && typeof result === "object" && "notified" in result) {
        return result;
      }
      return { notified: true };
    },
    async notifyDocumentDeactivated(documentId): Promise<WindowsNotifyResult> {
      if (!hooks?.onDocumentDeactivated) return { notified: false };
      const result = await hooks.onDocumentDeactivated(documentId);
      if (result && typeof result === "object" && "notified" in result) {
        return result;
      }
      return { notified: true };
    },
  };
}
