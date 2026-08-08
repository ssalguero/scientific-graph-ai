/**
 * PLUGINS-I6 — Lifecycle Engine status markers (C5).
 * Lifecycle decides. It never executes plugins.
 */

export const PLUGINS_LIFECYCLE_PHASE = "PLUGINS-I6" as const;
export const PLUGINS_LIFECYCLE_STATUS = "LIFECYCLE_ENGINE_IMPLEMENTED" as const;
export type PluginsLifecycleStatus = typeof PLUGINS_LIFECYCLE_STATUS;

export const PLUGINS_LIFECYCLE_FLAGS = {
  lifecycleImplemented: true,
  activationEligibilityImplemented: true,
  lifecycleConsumesContractsOnly: true,
  executionImplemented: false,
  runtimeLoadingImplemented: false,
  dynamicLoadingImplemented: false,
} as const;
