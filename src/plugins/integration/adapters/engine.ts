/**
 * PLUGINS-I9 — ENGINE peer integration adapter.
 * Workflow participation via ENGINE public extension contracts only.
 * ENGINE owns ENGINE extension points.
 */

import type { IntegrationAdapterDescriptor } from "../descriptors";

export const PLUGINS_ENGINE_INTEGRATION_ADAPTER: IntegrationAdapterDescriptor = {
  __kind: "IntegrationAdapterDescriptor",
  __orchestratesOnly: true,
  __ownsPeerExtensionPoints: false,
  __consumesPeerInternals: false,
  __executesPlugins: false,
  __loadsPlugins: false,
  peer: "ENGINE",
  adapterId: "plugins.integration.engine",
  participation: "workflow",
  publicContracts: [
    {
      __kind: "PeerPublicContractRef",
      __certifiedPublicSurface: true,
      __peerInternal: false,
      peer: "ENGINE",
      surfaceId: "engine.public-extension-contract.v0",
      versionLabel: "v0",
    },
    {
      __kind: "PeerPublicContractRef",
      __certifiedPublicSurface: true,
      __peerInternal: false,
      peer: "ENGINE",
      surfaceId: "engine.workflow-participation-contract.v0",
      versionLabel: "v0",
    },
  ],
  notes:
    "Orchestrates plugin governance toward ENGINE-owned workflow EPs; never owns ENGINE workflows or internals.",
};
