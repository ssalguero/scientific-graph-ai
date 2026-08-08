/**
 * PLUGINS-I9 — Public integration views (orchestration surfaces).
 */

import type { IntegrationAdapterDescriptor } from "./descriptors";
import type { ExtensionPointBindingView } from "./descriptors";
import { getIntegrationAdapterRegistryView } from "./registry";
import { PLUGINS_PEER_OWNERSHIP, type PeerDomainId } from "./peers";
import { PLUGINS_INTEGRATION_FLAGS } from "./status";
import { PLUGINS_INTEGRATION_IDENTITY } from "./identity";

export type IntegrationPublicView = {
  readonly __kind: "IntegrationPublicView";
  readonly __peerContractsOnly: true;
  readonly __peerInternalAccess: false;
  readonly __executionImplemented: false;
  readonly phase: "PLUGINS-I9";
  readonly identity: typeof PLUGINS_INTEGRATION_IDENTITY;
  readonly flags: typeof PLUGINS_INTEGRATION_FLAGS;
  readonly peers: typeof PLUGINS_PEER_OWNERSHIP;
  readonly adapters: readonly IntegrationAdapterDescriptor[];
};

export type CrossDomainIntegrationView = {
  readonly __kind: "CrossDomainIntegrationView";
  readonly __ownershipTransfer: false;
  readonly flow: "Plugin → PLUGINS → ENGINE → DATA";
  readonly peerIntegrations: readonly PeerDomainId[];
  readonly adapters: readonly IntegrationAdapterDescriptor[];
};

export function getIntegrationPublicView(): IntegrationPublicView {
  const registry = getIntegrationAdapterRegistryView();
  return {
    __kind: "IntegrationPublicView",
    __peerContractsOnly: true,
    __peerInternalAccess: false,
    __executionImplemented: false,
    phase: "PLUGINS-I9",
    identity: PLUGINS_INTEGRATION_IDENTITY,
    flags: PLUGINS_INTEGRATION_FLAGS,
    peers: PLUGINS_PEER_OWNERSHIP,
    adapters: registry.adapters,
  };
}

export function getCrossDomainIntegrationView(): CrossDomainIntegrationView {
  const registry = getIntegrationAdapterRegistryView();
  return {
    __kind: "CrossDomainIntegrationView",
    __ownershipTransfer: false,
    flow: "Plugin → PLUGINS → ENGINE → DATA",
    peerIntegrations: ["ENGINE", "DATA", "AI", "UX", "COLLAB"],
    adapters: registry.adapters,
  };
}

export type { ExtensionPointBindingView };
