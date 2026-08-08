/**
 * PLUGINS-I6 — Lifecycle Coordinator identity (C5).
 * Authority: PLUGINS-P5 Lifecycle Freeze · PLUGINS-P6 I6.
 */

export const PLUGINS_LIFECYCLE_COMPONENT_ID =
  "C5_LifecycleCoordinator" as const;
export const PLUGINS_LIFECYCLE_NAME = "Lifecycle Coordinator" as const;
export const PLUGINS_LIFECYCLE_PURPOSE =
  "Platform-governed lifecycle state and activation eligibility; never executes plugins" as const;

export const PLUGINS_LIFECYCLE_IDENTITY = {
  componentId: PLUGINS_LIFECYCLE_COMPONENT_ID,
  name: PLUGINS_LIFECYCLE_NAME,
  purpose: PLUGINS_LIFECYCLE_PURPOSE,
  platformGoverned: true as const,
  pluginSelfManaged: false as const,
  consumesPublicContractsOnly: true as const,
  ownsActivationEligibility: true as const,
  evaluatesCapabilities: false as const,
  evaluatesPermissions: false as const,
  mutatesRegistry: false as const,
  readsRegistryStore: false as const,
  executesPlugins: false as const,
  /** Active = lifecycle-eligible, not currently executing. */
  activeMeansExecution: false as const,
} as const;

export type PluginsLifecycleIdentity = typeof PLUGINS_LIFECYCLE_IDENTITY;
