/**
 * PLUGINS-I4 — Registry read-only view.
 *
 * Capabilities / Permissions may read registry state through this view.
 * No mutation APIs. Does not evaluate capabilities or permissions.
 */

import { registryStoreGetState } from "./store";
import type { PluginRegistryState } from "./state";

export type PluginRegistryReadView = {
  readonly __view: "PluginRegistryReadView";
  readonly __mutable: false;
  readonly __evaluatesCapabilities: false;
  readonly __evaluatesPermissions: false;
  getState(): PluginRegistryState;
};

export function createPluginRegistryReadView(): PluginRegistryReadView {
  return {
    __view: "PluginRegistryReadView",
    __mutable: false,
    __evaluatesCapabilities: false,
    __evaluatesPermissions: false,
    getState: () => registryStoreGetState(),
  };
}
