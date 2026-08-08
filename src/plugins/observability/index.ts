/**
 * PLUGINS-I8 — Observability barrel (package-internal).
 * Observability aggregates. Never decides. Never executes.
 */

export {
  PLUGINS_OBSERVABILITY_PHASE,
  PLUGINS_OBSERVABILITY_STATUS,
  PLUGINS_OBSERVABILITY_FLAGS,
} from "./status";
export type { PluginsObservabilityStatus } from "./status";

export {
  PLUGINS_OBSERVABILITY_NAME,
  PLUGINS_OBSERVABILITY_PURPOSE,
  PLUGINS_OBSERVABILITY_IDENTITY,
} from "./identity";
export type { PluginsObservabilityIdentity } from "./identity";

export type {
  SystemHealth,
  ObservabilityMetrics,
  ObservabilityEvent,
  ObservabilityView,
} from "./descriptors";

export { aggregateObservability } from "./aggregate";

export { composePluginsObservability } from "./wiring";
export type { PluginsObservabilitySnapshot } from "./wiring";
