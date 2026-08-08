/**
 * PLUGINS-I9 — Integration adapter registry (PLUGINS-owned catalog).
 * Catalogs orchestration adapters. Does not own peer registries or EPs.
 */

import { PLUGINS_ALL_INTEGRATION_ADAPTERS } from "./adapters";
import type { IntegrationAdapterDescriptor } from "./descriptors";
import type { PeerDomainId } from "./peers";

export type IntegrationAdapterRegistryView = {
  readonly __kind: "IntegrationAdapterRegistryView";
  readonly __ownsPeerRegistries: false;
  readonly __ownsPeerExtensionPoints: false;
  readonly adapters: readonly IntegrationAdapterDescriptor[];
  readonly peerCount: number;
};

export function listIntegrationAdapters(): readonly IntegrationAdapterDescriptor[] {
  return PLUGINS_ALL_INTEGRATION_ADAPTERS;
}

export function getIntegrationAdapter(
  peer: PeerDomainId,
): IntegrationAdapterDescriptor | undefined {
  return PLUGINS_ALL_INTEGRATION_ADAPTERS.find((a) => a.peer === peer);
}

export function getIntegrationAdapterRegistryView(): IntegrationAdapterRegistryView {
  return {
    __kind: "IntegrationAdapterRegistryView",
    __ownsPeerRegistries: false,
    __ownsPeerExtensionPoints: false,
    adapters: PLUGINS_ALL_INTEGRATION_ADAPTERS,
    peerCount: PLUGINS_ALL_INTEGRATION_ADAPTERS.length,
  };
}
