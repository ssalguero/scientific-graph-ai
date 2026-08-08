/**
 * PLUGINS-I9 — COLLAB peer integration adapter.
 * Collaboration extension interfaces; metadata participation only.
 * COLLAB owns COLLAB extension points and collaboration metadata.
 */

import type { IntegrationAdapterDescriptor } from "../descriptors";

export const PLUGINS_COLLAB_INTEGRATION_ADAPTER: IntegrationAdapterDescriptor = {
  __kind: "IntegrationAdapterDescriptor",
  __orchestratesOnly: true,
  __ownsPeerExtensionPoints: false,
  __consumesPeerInternals: false,
  __executesPlugins: false,
  __loadsPlugins: false,
  peer: "COLLAB",
  adapterId: "plugins.integration.collab",
  participation: "collaboration-metadata",
  publicContracts: [
    {
      __kind: "PeerPublicContractRef",
      __certifiedPublicSurface: true,
      __peerInternal: false,
      peer: "COLLAB",
      surfaceId: "collab.public-extension-contract.v0",
      versionLabel: "v0",
    },
  ],
  notes:
    "Orchestrates toward COLLAB-owned metadata EPs; never owns collaboration internals.",
};
