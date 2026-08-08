/**
 * PLUGINS-I9 — Integration identity (C10 Extension Point Resolver + peer adapters).
 */

export const PLUGINS_INTEGRATION_COMPONENT_ID =
  "C10_ExtensionPointResolver" as const;
export const PLUGINS_INTEGRATION_NAME = "Platform Integration" as const;
export const PLUGINS_INTEGRATION_PURPOSE =
  "Orchestrate plugin governance toward peer-owned extension points via public contracts only" as const;

export const PLUGINS_INTEGRATION_IDENTITY = {
  componentId: PLUGINS_INTEGRATION_COMPONENT_ID,
  name: PLUGINS_INTEGRATION_NAME,
  purpose: PLUGINS_INTEGRATION_PURPOSE,
  ownsPeerExtensionPoints: false as const,
  ownsPeerFunctionality: false as const,
  peerContractsOnly: true as const,
  peerInternalAccess: false as const,
  transfersOwnership: false as const,
  executesPlugins: false as const,
  loadsPlugins: false as const,
  bypassesPublicContracts: false as const,
} as const;

export type PluginsIntegrationIdentity = typeof PLUGINS_INTEGRATION_IDENTITY;
