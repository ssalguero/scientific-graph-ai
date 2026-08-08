/**
 * PLUGINS-I9 — Peer domain catalog (ownership freeze).
 *
 * Peers own their extension points exclusively.
 * PLUGINS never absorbs peer ownership.
 */

export const PLUGINS_PEER_DOMAINS = [
  "ENGINE",
  "DATA",
  "AI",
  "UX",
  "COLLAB",
] as const;

export type PeerDomainId = (typeof PLUGINS_PEER_DOMAINS)[number];

export type PeerOwnershipRecord = {
  readonly peer: PeerDomainId;
  readonly ownsOwnExtensionPoints: true;
  readonly pluginsOwnsPeer: false;
  readonly pluginsMayAccessInternals: false;
};

export const PLUGINS_PEER_OWNERSHIP: readonly PeerOwnershipRecord[] = [
  {
    peer: "ENGINE",
    ownsOwnExtensionPoints: true,
    pluginsOwnsPeer: false,
    pluginsMayAccessInternals: false,
  },
  {
    peer: "DATA",
    ownsOwnExtensionPoints: true,
    pluginsOwnsPeer: false,
    pluginsMayAccessInternals: false,
  },
  {
    peer: "AI",
    ownsOwnExtensionPoints: true,
    pluginsOwnsPeer: false,
    pluginsMayAccessInternals: false,
  },
  {
    peer: "UX",
    ownsOwnExtensionPoints: true,
    pluginsOwnsPeer: false,
    pluginsMayAccessInternals: false,
  },
  {
    peer: "COLLAB",
    ownsOwnExtensionPoints: true,
    pluginsOwnsPeer: false,
    pluginsMayAccessInternals: false,
  },
] as const;
