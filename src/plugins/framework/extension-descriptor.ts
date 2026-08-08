/**
 * PLUGINS-I1 — Conceptual extension descriptor (structure only).
 *
 * Describes what a future Manifest / registration path may declare.
 * No parsing, loading, discovery, or registration in I1.
 *
 * Authority: PLUGINS-P2 Manifest concept · P3 C11 deferred.
 */

import type {
  CapabilityId,
  PluginIdentity,
  PluginVersion,
  PublicPluginContractId,
} from "../types";

/**
 * Structural descriptor shape for a plugin contribution intent.
 * Fields are optional markers — not a runtime schema and not validated here.
 */
export type ExtensionDescriptor = {
  readonly __kind: "ExtensionDescriptor";
  readonly __executable: false;
  readonly __registrableInI1: false;
  readonly identity?: PluginIdentity;
  readonly version?: PluginVersion;
  readonly declaredCapabilityIds?: readonly CapabilityId[];
  readonly requiredPublicContractIds?: readonly PublicPluginContractId[];
};

export const PLUGINS_EXTENSION_DESCRIPTOR_EXECUTABLE = false as const;
export const PLUGINS_EXTENSION_DESCRIPTOR_REGISTRABLE_IN_I1 = false as const;
