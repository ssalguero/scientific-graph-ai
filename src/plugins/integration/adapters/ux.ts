/**
 * PLUGINS-I9 — UX peer integration adapter.
 * UI extension interfaces; Design System compliance only.
 * UX owns UX extension points and presentation.
 */

import type { IntegrationAdapterDescriptor } from "../descriptors";

export const PLUGINS_UX_INTEGRATION_ADAPTER: IntegrationAdapterDescriptor = {
  __kind: "IntegrationAdapterDescriptor",
  __orchestratesOnly: true,
  __ownsPeerExtensionPoints: false,
  __consumesPeerInternals: false,
  __executesPlugins: false,
  __loadsPlugins: false,
  peer: "UX",
  adapterId: "plugins.integration.ux",
  participation: "ui-extension",
  publicContracts: [
    {
      __kind: "PeerPublicContractRef",
      __certifiedPublicSurface: true,
      __peerInternal: false,
      peer: "UX",
      surfaceId: "ux.public-extension-contract.v0",
      versionLabel: "v0",
    },
  ],
  notes:
    "Orchestrates toward UX-owned UI EPs under Design System compliance; never owns presentation.",
};
