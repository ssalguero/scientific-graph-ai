/**
 * PLUGINS-I9 — C10 Extension Point Resolver (conceptual).
 *
 * Resolves capability → peer public-contract EP binding views.
 * Does not execute plugins. Does not access peer internals.
 * Peer domains retain exclusive ownership of resolved EPs.
 */

import type { CapabilityId } from "../types/vocabulary";
import type { ExtensionPointBindingView } from "./descriptors";
import { getIntegrationAdapter } from "./registry";
import type { PeerDomainId } from "./peers";

export type ResolveExtensionPointInput = {
  readonly peer: PeerDomainId;
  readonly extensionPointRef: string;
  readonly capabilityId?: CapabilityId | string;
};

/**
 * Resolve a conceptual EP binding against a peer public contract surface.
 * Returns a non-executable binding view; peer owns the EP.
 */
export function resolveExtensionPointBinding(
  input: ResolveExtensionPointInput,
): ExtensionPointBindingView | undefined {
  const adapter = getIntegrationAdapter(input.peer);
  if (!adapter) return undefined;
  const surface = adapter.publicContracts[0];
  if (!surface) return undefined;

  return {
    __kind: "ExtensionPointBindingView",
    __ownsExtensionPoint: false,
    __peerOwnsExtensionPoint: true,
    peer: input.peer,
    extensionPointRef: input.extensionPointRef,
    capabilityId:
      typeof input.capabilityId === "string"
        ? input.capabilityId
        : input.capabilityId !== undefined
          ? String(input.capabilityId)
          : undefined,
    publicContractSurfaceId: surface.surfaceId,
    resolved: true,
    executable: false,
  };
}
