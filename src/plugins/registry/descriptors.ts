/**
 * PLUGINS-I3 — Registry descriptor abstractions.
 *
 * Descriptors remain structural. Incorporation into SSOT occurs only via
 * Registry Registration Service (never via Discovery).
 */

import type { CapabilityId, ExtensionPointRef, PluginIdentity, PluginVersion } from "../types";

export type PluginRegistryDescriptor = {
  readonly __kind: "PluginRegistryDescriptor";
  /** Historical I2 flag — descriptors were not registrable in I2. */
  readonly __registrableInI2: false;
  /** I3: structurally eligible for Registration → Registry Service. */
  readonly __registrableViaRegistrationService: true;
  readonly __discoverableInI2: false;
  readonly identity: PluginIdentity;
  readonly version?: PluginVersion;
  readonly declaredCapabilityIds: readonly CapabilityId[];
};

export type ExtensionPointReferenceDescriptor = {
  readonly __kind: "ExtensionPointReferenceDescriptor";
  readonly __ownsExtensionPoint: false;
  readonly extensionPointRef?: ExtensionPointRef;
};

export const PLUGINS_REGISTRY_DESCRIPTOR_REGISTRABLE_IN_I2 = false as const;
export const PLUGINS_REGISTRY_DESCRIPTOR_DISCOVERABLE_IN_I2 = false as const;
export const PLUGINS_REGISTRY_DESCRIPTOR_REGISTRABLE_VIA_SERVICE = true as const;
