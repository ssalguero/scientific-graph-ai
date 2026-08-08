/**
 * PLUGINS-I3 — Registry Public Registration Interface (C2).
 *
 * Exclusive bridge for incorporating descriptors into registry state.
 * Discovery must never call store mutation APIs — only this service.
 *
 * Does not activate, load, or execute plugins.
 */

import type { CapabilityId, PluginIdentity, PluginVersion } from "../types";
import {
  registryStoreAppendEntry,
  registryStoreGetState,
} from "./store";
import type { PluginRegistryEntry, PluginRegistryState } from "./state";

export type RegistryRegistrationRequest = {
  readonly identity: PluginIdentity;
  readonly version?: PluginVersion;
  readonly declaredCapabilityIds?: readonly CapabilityId[];
};

export type RegistryRegistrationSuccess = {
  readonly ok: true;
  readonly entry: PluginRegistryEntry;
  readonly state: PluginRegistryState;
};

export type RegistryRegistrationFailure = {
  readonly ok: false;
  readonly error: string;
  readonly state: PluginRegistryState;
};

export type RegistryRegistrationResult =
  | RegistryRegistrationSuccess
  | RegistryRegistrationFailure;

export type PluginRegistryRegistrationService = {
  readonly __service: "PluginRegistryRegistrationService";
  readonly __ownsRegistryState: true;
  readonly __activatesPlugins: false;
  readonly __loadsPlugins: false;
  getState(): PluginRegistryState;
  /**
   * Sole public mutation entry for registry state.
   * Structural uniqueness on PluginIdentity only — no capability/lifecycle evaluation.
   */
  registerEntry(request: RegistryRegistrationRequest): RegistryRegistrationResult;
};

/**
 * Create the Registry Registration Service (framework-owned subsystem API).
 * Package-internal consumers: Registration subsystem only.
 */
export function createPluginRegistryRegistrationService(): PluginRegistryRegistrationService {
  return {
    __service: "PluginRegistryRegistrationService",
    __ownsRegistryState: true,
    __activatesPlugins: false,
    __loadsPlugins: false,
    getState: () => registryStoreGetState(),
    registerEntry: (request) => {
      const result = registryStoreAppendEntry({
        identity: request.identity,
        version: request.version,
        declaredCapabilityIds: request.declaredCapabilityIds ?? [],
      });
      const state = registryStoreGetState();
      if (!result.ok) {
        return { ok: false, error: result.error, state };
      }
      return { ok: true, entry: result.entry, state };
    },
  };
}
