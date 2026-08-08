/**
 * PLUGINS-I3 — Registration Service identity (C4).
 */

export const PLUGINS_REGISTRATION_COMPONENT_ID =
  "C4_RegistrationService" as const;
export const PLUGINS_REGISTRATION_NAME = "Registration Service" as const;
export const PLUGINS_REGISTRATION_PURPOSE =
  "Validate structural eligibility and request Registry incorporation" as const;

export const PLUGINS_REGISTRATION_IDENTITY = {
  componentId: PLUGINS_REGISTRATION_COMPONENT_ID,
  name: PLUGINS_REGISTRATION_NAME,
  purpose: PLUGINS_REGISTRATION_PURPOSE,
  ownsRegistryState: false as const,
  mutatesRegistryOnlyViaService: true as const,
  activatesPlugins: false as const,
  executesPlugins: false as const,
  evaluatesCapabilities: false as const,
} as const;

export type PluginsRegistrationIdentity = typeof PLUGINS_REGISTRATION_IDENTITY;
