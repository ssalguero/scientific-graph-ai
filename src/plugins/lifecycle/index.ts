/**
 * PLUGINS-I6 — Lifecycle Engine barrel (package-internal).
 *
 * Lifecycle consumes Public Contracts only.
 * Does not re-export Registry Store, Capability/Permission evaluators, or execution APIs.
 */

export {
  PLUGINS_LIFECYCLE_PHASE,
  PLUGINS_LIFECYCLE_STATUS,
  PLUGINS_LIFECYCLE_FLAGS,
} from "./status";
export type { PluginsLifecycleStatus } from "./status";

export {
  PLUGINS_LIFECYCLE_COMPONENT_ID,
  PLUGINS_LIFECYCLE_NAME,
  PLUGINS_LIFECYCLE_PURPOSE,
  PLUGINS_LIFECYCLE_IDENTITY,
} from "./identity";
export type { PluginsLifecycleIdentity } from "./identity";

export type {
  LifecycleActivationEligibility,
  LifecyclePluginRecord,
  LifecycleDecision,
  LifecycleDiagnostic,
} from "./descriptors";

export {
  PLUGINS_LIFECYCLE_STATES,
  createEmptyLifecycleEngineState,
  createLifecyclePluginRecord,
} from "./state";
export type { LifecycleEngineState } from "./state";

export {
  PLUGINS_ALLOWED_LIFECYCLE_TRANSITIONS,
  isAllowedLifecycleTransition,
} from "./transitions";
export type { LifecycleTransition } from "./transitions";

export { PLUGINS_LIFECYCLE_DIAGNOSTICS_METADATA } from "./diagnostics";
export type { LifecycleDiagnosticsMetadata } from "./diagnostics";

export {
  decideFromPublicContract,
  applyLifecycleTransition,
  getLifecycleState,
  lifecycleClearForTests,
} from "./controller";
export type {
  LifecycleControllerResult,
  LifecycleTransitionResult,
} from "./controller";

export { composePluginsLifecycle } from "./wiring";
export type { PluginsLifecycleSnapshot } from "./wiring";
