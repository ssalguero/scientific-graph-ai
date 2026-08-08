/**
 * PLUGINS-I3 — Registration status markers (C4).
 * Registration requests. Registry owns.
 */

export const PLUGINS_REGISTRATION_PHASE = "PLUGINS-I3" as const;
export const PLUGINS_REGISTRATION_STATUS = "REGISTRATION_IMPLEMENTED" as const;
export type PluginsRegistrationStatus = typeof PLUGINS_REGISTRATION_STATUS;
