/**
 * PLUGINS-I9 — Integration descriptors (public-contract orchestration only).
 *
 * Conceptual peer public extension contracts — not peer internals,
 * not peer implementation imports, not runtime loading.
 */

import type { PeerDomainId } from "./peers";

/** Certified public extension contract surface id (peer-owned conceptually). */
export type PeerPublicContractSurfaceId = string & {
  readonly __brand: "PeerPublicContractSurfaceId";
};

export type IntegrationParticipationKind =
  | "workflow"
  | "scientific-data"
  | "ai-extension"
  | "ui-extension"
  | "collaboration-metadata";

export type PeerPublicContractRef = {
  readonly __kind: "PeerPublicContractRef";
  readonly __certifiedPublicSurface: true;
  readonly __peerInternal: false;
  readonly peer: PeerDomainId;
  readonly surfaceId: string;
  readonly versionLabel: string;
};

export type IntegrationAdapterDescriptor = {
  readonly __kind: "IntegrationAdapterDescriptor";
  readonly __orchestratesOnly: true;
  readonly __ownsPeerExtensionPoints: false;
  readonly __consumesPeerInternals: false;
  readonly __executesPlugins: false;
  readonly __loadsPlugins: false;
  readonly peer: PeerDomainId;
  readonly adapterId: string;
  readonly participation: IntegrationParticipationKind;
  readonly publicContracts: readonly PeerPublicContractRef[];
  readonly notes: string;
};

export type ExtensionPointBindingView = {
  readonly __kind: "ExtensionPointBindingView";
  readonly __ownsExtensionPoint: false;
  readonly __peerOwnsExtensionPoint: true;
  readonly peer: PeerDomainId;
  readonly extensionPointRef: string;
  readonly capabilityId?: string;
  readonly publicContractSurfaceId: string;
  readonly resolved: true;
  readonly executable: false;
};

export type IntegrationDiagnostic =
  | { readonly code: "ADAPTER_REGISTERED"; readonly message: string; readonly peer: PeerDomainId }
  | { readonly code: "BINDING_RESOLVED"; readonly message: string; readonly peer: PeerDomainId }
  | { readonly code: "PEER_INTERNAL_FORBIDDEN"; readonly message: string }
  | { readonly code: "OWNERSHIP_PRESERVED"; readonly message: string; readonly peer: PeerDomainId };
