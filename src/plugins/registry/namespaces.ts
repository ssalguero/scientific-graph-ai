/**
 * PLUGINS-I2 — Registry namespace constants (layer-local).
 */

export const PLUGINS_REGISTRY_NAMESPACES = [
  "registry",
  "registry/wiring",
] as const;

export type PluginsRegistryNamespace =
  (typeof PLUGINS_REGISTRY_NAMESPACES)[number];
