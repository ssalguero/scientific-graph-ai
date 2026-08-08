/**
 * PLUGINS-I3 — Discovery barrel (package-internal).
 * Discovery discovers. Never mutates Registry.
 */

export {
  PLUGINS_DISCOVERY_PHASE,
  PLUGINS_DISCOVERY_STATUS,
} from "./status";
export type { PluginsDiscoveryStatus } from "./status";

export {
  PLUGINS_DISCOVERY_COMPONENT_ID,
  PLUGINS_DISCOVERY_NAME,
  PLUGINS_DISCOVERY_PURPOSE,
  PLUGINS_DISCOVERY_IDENTITY,
} from "./identity";
export type { PluginsDiscoveryIdentity } from "./identity";

export type {
  PluginDiscoveryCandidate,
  PluginDiscoveryDescriptor,
  DiscoveryDiagnostic,
} from "./descriptors";

export { createEmptyDiscoveryState } from "./state";
export type { DiscoveryState } from "./state";

export { PLUGINS_DISCOVERY_DIAGNOSTICS_METADATA } from "./diagnostics";
export type { DiscoveryDiagnosticsMetadata } from "./diagnostics";

export { discoverPluginCandidates } from "./discover";
export type { DiscoveryResult } from "./discover";

export { composePluginsDiscovery } from "./wiring";
export type { PluginsDiscoverySnapshot } from "./wiring";
