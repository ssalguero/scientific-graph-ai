/**
 * PLUGINS-I9 — Platform Integration (IMPLEMENTED).
 *
 * Integration orchestrates. Peer domains own. PLUGINS extends.
 * Public contracts only. No peer internals. No execution. No loading.
 */

export {
  PLUGINS_INTEGRATION_PHASE,
  PLUGINS_INTEGRATION_STATUS,
  PLUGINS_INTEGRATION_FLAGS,
} from "./status";
export type { PluginsIntegrationStatus } from "./status";

export {
  PLUGINS_INTEGRATION_COMPONENT_ID,
  PLUGINS_INTEGRATION_NAME,
  PLUGINS_INTEGRATION_PURPOSE,
  PLUGINS_INTEGRATION_IDENTITY,
} from "./identity";
export type { PluginsIntegrationIdentity } from "./identity";

export {
  PLUGINS_PEER_DOMAINS,
  PLUGINS_PEER_OWNERSHIP,
} from "./peers";
export type { PeerDomainId, PeerOwnershipRecord } from "./peers";

export type {
  PeerPublicContractSurfaceId,
  IntegrationParticipationKind,
  PeerPublicContractRef,
  IntegrationAdapterDescriptor,
  ExtensionPointBindingView,
  IntegrationDiagnostic,
} from "./descriptors";

export {
  PLUGINS_ENGINE_INTEGRATION_ADAPTER,
  PLUGINS_DATA_INTEGRATION_ADAPTER,
  PLUGINS_AI_INTEGRATION_ADAPTER,
  PLUGINS_UX_INTEGRATION_ADAPTER,
  PLUGINS_COLLAB_INTEGRATION_ADAPTER,
  PLUGINS_ALL_INTEGRATION_ADAPTERS,
} from "./adapters";

export {
  listIntegrationAdapters,
  getIntegrationAdapter,
  getIntegrationAdapterRegistryView,
} from "./registry";
export type { IntegrationAdapterRegistryView } from "./registry";

export { resolveExtensionPointBinding } from "./resolver";
export type { ResolveExtensionPointInput } from "./resolver";

export {
  getIntegrationPublicView,
  getCrossDomainIntegrationView,
} from "./views";
export type {
  IntegrationPublicView,
  CrossDomainIntegrationView,
} from "./views";

export {
  collectIntegrationDiagnostics,
  getIntegrationHealthView,
} from "./diagnostics";
export type { IntegrationHealthView } from "./diagnostics";

export { composePluginsIntegration } from "./wiring";
export type { PluginsIntegrationComposition } from "./wiring";
