/**
 * ENGINE Domain — Injectable Runtime port wrappers (fakes / future Platform adapters).
 */

import type { RuntimePort } from "./ports";
import type {
  RuntimeInitializeInput,
  RuntimeNotifyResult,
  RuntimeShutdownInput,
} from "./types";

/** Minimal injectable Runtime surface (no React). */
export type InjectableRuntimeHooks = {
  onInitialized?(
    input: RuntimeInitializeInput,
  ): void | RuntimeNotifyResult | Promise<void | RuntimeNotifyResult>;
  onShutdown?(
    input: RuntimeShutdownInput,
  ): void | RuntimeNotifyResult | Promise<void | RuntimeNotifyResult>;
};

export function createInjectableRuntimePort(
  hooks: InjectableRuntimeHooks | null | undefined,
): RuntimePort {
  return {
    async notifyInitialized(input): Promise<RuntimeNotifyResult> {
      if (!hooks?.onInitialized) return { notified: false };
      const result = await hooks.onInitialized(input);
      if (result && typeof result === "object" && "notified" in result) {
        return result;
      }
      return { notified: true };
    },
    async notifyShutdown(input): Promise<RuntimeNotifyResult> {
      if (!hooks?.onShutdown) return { notified: false };
      const result = await hooks.onShutdown(input);
      if (result && typeof result === "object" && "notified" in result) {
        return result;
      }
      return { notified: true };
    },
  };
}
