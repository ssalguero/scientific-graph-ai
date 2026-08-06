/**
 * ENGINE Domain — Runtime coordination adapter barrel.
 * OWNERSHIP: ENGINE emits lifecycle coordination; Runtime (Platform) owns runtime infra.
 * Default ports are no-ops / injectable fakes — no Platform Runtime wired yet.
 */

export type { RuntimePort } from "./ports";
export type {
  RuntimeInitializeInput,
  RuntimeNotifyResult,
  RuntimeShutdownInput,
} from "./types";
export { createNoOpRuntimePort } from "./noop-ports";
export {
  createInjectableRuntimePort,
  type InjectableRuntimeHooks,
} from "./injectable-ports";

export const RUNTIME_COORDINATION_OWNERSHIP =
  "ENGINE coordinates application lifecycle events; Runtime owns platform runtime.";
