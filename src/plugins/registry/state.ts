/**
 * PLUGINS-I3 — Plugin Registry state model (C2 SSOT).
 *
 * Registry owns this state. Mutation only via Registry Registration Service.
 * Discovery must never write here directly.
 */

import type { CapabilityId, PluginIdentity, PluginVersion } from "../types";

export type PluginRegistryEntry = {
  readonly __kind: "PluginRegistryEntry";
  readonly __populatedBy: "PLUGINS-I3";
  readonly identity: PluginIdentity;
  readonly version?: PluginVersion;
  readonly declaredCapabilityIds: readonly CapabilityId[];
  readonly registeredAtOrdinal: number;
};

export type PluginRegistryState = {
  readonly __kind: "PluginRegistryState";
  readonly __ssot: "C2_PluginRegistry";
  /** I2 was immutable; I3 allows mutation exclusively via registration service. */
  readonly __mutableOnlyViaRegistrationService: true;
  readonly entries: readonly PluginRegistryEntry[];
  readonly entryCount: number;
};

export const PLUGINS_EMPTY_PLUGIN_REGISTRY_STATE: PluginRegistryState = {
  __kind: "PluginRegistryState",
  __ssot: "C2_PluginRegistry",
  __mutableOnlyViaRegistrationService: true,
  entries: [],
  entryCount: 0,
};

export function createPluginRegistryState(
  entries: readonly PluginRegistryEntry[],
): PluginRegistryState {
  return {
    __kind: "PluginRegistryState",
    __ssot: "C2_PluginRegistry",
    __mutableOnlyViaRegistrationService: true,
    entries: [...entries],
    entryCount: entries.length,
  };
}
