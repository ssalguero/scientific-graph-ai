/**
 * PLUGINS-I9 — AI peer integration adapter.
 * AI extension interfaces via AI public contracts only.
 * AI owns AI extension points and reasoning ownership.
 */

import type { IntegrationAdapterDescriptor } from "../descriptors";

export const PLUGINS_AI_INTEGRATION_ADAPTER: IntegrationAdapterDescriptor = {
  __kind: "IntegrationAdapterDescriptor",
  __orchestratesOnly: true,
  __ownsPeerExtensionPoints: false,
  __consumesPeerInternals: false,
  __executesPlugins: false,
  __loadsPlugins: false,
  peer: "AI",
  adapterId: "plugins.integration.ai",
  participation: "ai-extension",
  publicContracts: [
    {
      __kind: "PeerPublicContractRef",
      __certifiedPublicSurface: true,
      __peerInternal: false,
      peer: "AI",
      surfaceId: "ai.public-extension-contract.v0",
      versionLabel: "v0",
    },
  ],
  notes:
    "Orchestrates toward AI-owned extension EPs; never owns AI reasoning or internals.",
};
