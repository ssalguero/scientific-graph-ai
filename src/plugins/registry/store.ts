/**
 * PLUGINS-I3 — Internal registry store (package-private).
 *
 * Only `registration-service.ts` may mutate this store.
 * Discovery and Registration subsystems must not import mutation helpers
 * other than the public registration service API.
 */

import type { PluginRegistryEntry } from "./state";
import {
  PLUGINS_EMPTY_PLUGIN_REGISTRY_STATE,
  createPluginRegistryState,
  type PluginRegistryState,
} from "./state";

let ordinal = 0;
let entries: PluginRegistryEntry[] = [];

export function registryStoreGetState(): PluginRegistryState {
  if (entries.length === 0) return PLUGINS_EMPTY_PLUGIN_REGISTRY_STATE;
  return createPluginRegistryState(entries);
}

export function registryStoreClearForTests(): void {
  entries = [];
  ordinal = 0;
}

/**
 * Internal append — invoked only by registration-service.
 * Returns false if identity already present (structural uniqueness).
 */
export function registryStoreAppendEntry(
  partial: Omit<PluginRegistryEntry, "registeredAtOrdinal" | "__kind" | "__populatedBy">,
): { ok: true; entry: PluginRegistryEntry } | { ok: false; error: string } {
  if (entries.some((e) => e.identity === partial.identity)) {
    return { ok: false, error: `duplicate plugin identity: ${partial.identity}` };
  }
  ordinal += 1;
  const entry: PluginRegistryEntry = {
    __kind: "PluginRegistryEntry",
    __populatedBy: "PLUGINS-I3",
    identity: partial.identity,
    version: partial.version,
    declaredCapabilityIds: [...partial.declaredCapabilityIds],
    registeredAtOrdinal: ordinal,
  };
  entries = [...entries, entry];
  return { ok: true, entry };
}
