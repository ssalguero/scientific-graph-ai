/**
 * PLUGINS-I7 — Validation certification identity.
 * Consumes Compatibility reports — does not replace Compatibility.
 */

export const PLUGINS_VALIDATION_COMPONENT_NAME =
  "Validation Certification" as const;
export const PLUGINS_VALIDATION_PURPOSE =
  "Certify planning / architecture / ownership / contract / lifecycle compliance via reports" as const;

export const PLUGINS_VALIDATION_IDENTITY = {
  name: PLUGINS_VALIDATION_COMPONENT_NAME,
  purpose: PLUGINS_VALIDATION_PURPOSE,
  phase: "PLUGINS-I7" as const,
  replacesCompatibility: false as const,
  mutatesRegistry: false as const,
  mutatesLifecycle: false as const,
  activatesPlugins: false as const,
  executesPlugins: false as const,
  reEvaluatesCompatibility: false as const,
} as const;

export type PluginsValidationIdentity = typeof PLUGINS_VALIDATION_IDENTITY;
