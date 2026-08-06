/**
 * ENGINE Domain — Windows coordination adapter barrel.
 * OWNERSHIP: ENGINE may request window/workspace ops; Windows (Platform) owns window infra.
 * Default ports are no-ops / injectable fakes — no WindowManager / React imports.
 */

export type { WindowsPort } from "./ports";
export type {
  WindowsDocumentNotifyInput,
  WindowsNotifyResult,
} from "./types";
export { createNoOpWindowsPort } from "./noop-ports";
export {
  createInjectableWindowsPort,
  type InjectableWindowsHooks,
} from "./injectable-ports";

export const WINDOWS_COORDINATION_OWNERSHIP =
  "ENGINE coordinates window ops via contracts; Windows owns window infrastructure.";
