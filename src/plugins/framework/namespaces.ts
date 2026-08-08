/**
 * PLUGINS-I1 — Implementation namespaces aligned to physical package folders.
 * Authority: PLUGINS-P3 / P6 layer mapping.
 */

export const PLUGINS_IMPLEMENTATION_NAMESPACES = [
  "foundation",
  "types",
  "abstractions",
  "framework",
  "registry",
  "discovery",
  "registration",
  "admission",
  "capabilities",
  "permissions",
  "capability",
  "contracts",
  "lifecycle",
  "compatibility",
  "validation",
  "diagnostics",
  "observability",
  "integration",
  "certification",
  "sdk",
  "public",
  "internal",
] as const;

export type PluginsImplementationNamespace =
  (typeof PLUGINS_IMPLEMENTATION_NAMESPACES)[number];
