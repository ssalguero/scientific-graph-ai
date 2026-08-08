/**
 * PLUGINS-I1 — Ownership / boundary freeze constants for the Extension Framework.
 * Cite Charter Extension Point Ownership · Public Contracts Only · Plugins Optional.
 */

export const PLUGINS_FRAMEWORK_OWNERSHIP = {
  ownsExtensionPoints: false,
  ownsPeerDomainLogic: false,
  ownsScientificTruth: false,
  ownsWorkflowOrchestration: false,
  ownsAiReasoning: false,
  ownsPresentation: false,
  ownsCollaborationMetadata: false,
  ownsIntegrationGovernanceCohesion: true,
  publicContractsOnly: true,
  pluginsOptional: true,
  pluginsExtendNeverOwn: true,
} as const;

export type PluginsFrameworkOwnership = typeof PLUGINS_FRAMEWORK_OWNERSHIP;

/** Peer domains that exclusively own their extension points. */
export const PLUGINS_PEER_EXTENSION_POINT_OWNERS = [
  "ENGINE",
  "DATA",
  "AI",
  "UX",
  "COLLAB",
] as const;

export type PluginsPeerExtensionPointOwner =
  (typeof PLUGINS_PEER_EXTENSION_POINT_OWNERS)[number];
