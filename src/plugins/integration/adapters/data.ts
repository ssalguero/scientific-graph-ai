/**
 * PLUGINS-I9 — DATA peer integration adapter.
 * Scientific data extension interfaces via DATA public contracts only.
 * DATA owns scientific truth and DATA extension points.
 */

import type { IntegrationAdapterDescriptor } from "../descriptors";

export const PLUGINS_DATA_INTEGRATION_ADAPTER: IntegrationAdapterDescriptor = {
  __kind: "IntegrationAdapterDescriptor",
  __orchestratesOnly: true,
  __ownsPeerExtensionPoints: false,
  __consumesPeerInternals: false,
  __executesPlugins: false,
  __loadsPlugins: false,
  peer: "DATA",
  adapterId: "plugins.integration.data",
  participation: "scientific-data",
  publicContracts: [
    {
      __kind: "PeerPublicContractRef",
      __certifiedPublicSurface: true,
      __peerInternal: false,
      peer: "DATA",
      surfaceId: "data.public-extension-contract.v0",
      versionLabel: "v0",
    },
  ],
  notes:
    "Orchestrates toward DATA-owned scientific data EPs; never owns DATA truth or internals.",
};
