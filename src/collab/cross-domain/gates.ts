/**
 * COLLAB-I8 — Integration gate principles (P1 · P4 · Charter).
 *
 * Hardening (I9) and Domain Certification (I10) remain deferred.
 */

export const COLLAB_I8_INTEGRATION_PEERS = [
  "ENGINE",
  "DATA",
  "UX",
] as const;

export const COLLAB_I8_PEER_ONLY = ["AI"] as const;

export const COLLAB_I8_DEFERRED = [
  "Hardening",
  "DomainCertification",
  "CollaborativeAiRuntime",
  "RealtimeSync",
  "CollaborativeCursors",
] as const;

export const COLLAB_I8_NON_BYPASS =
  "COLLAB never bypasses ENGINE Product Flows" as const;

export const COLLAB_I8_NON_BLOCKING =
  "COLLAB failure MUST NOT block ENGINE, DATA, or AI" as const;

export type CollabIntegrationGateReport = {
  readonly nonBypass: boolean;
  readonly nonBlocking: boolean;
  readonly aiPeerOnly: boolean;
  readonly engineSeamReady: boolean;
  readonly dataSeamReady: boolean;
  readonly uxSeamReady: boolean;
  readonly ok: boolean;
};
