/**
 * ENGINE Domain — Runtime coordination ports (injectable; no React).
 * OWNERSHIP: ENGINE defines ports; Runtime (Platform) may fulfill later.
 * Theme runtime under `@/ui/theme/runtime` is NOT application Runtime — do not import it.
 */

import type {
  RuntimeInitializeInput,
  RuntimeNotifyResult,
  RuntimeShutdownInput,
} from "./types";

/**
 * Application Runtime notification port — init / shutdown hooks only.
 * Does not own Runtime registries, providers, or bridges.
 */
export type RuntimePort = {
  notifyInitialized(
    input: RuntimeInitializeInput,
  ): RuntimeNotifyResult | Promise<RuntimeNotifyResult>;
  notifyShutdown(
    input: RuntimeShutdownInput,
  ): RuntimeNotifyResult | Promise<RuntimeNotifyResult>;
};
