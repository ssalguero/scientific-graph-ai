/**
 * PLUGINS-I2 — Plugin Registry identity (C2).
 *
 * Authority: PLUGINS-P3 Component Inventory · P6 I2 · Registry Pattern.
 * Passive architectural state SSOT — not an extensible public surface (P4).
 */

export const PLUGINS_PLUGIN_REGISTRY_COMPONENT_ID = "C2_PluginRegistry" as const;

export const PLUGINS_PLUGIN_REGISTRY_NAME = "Plugin Registry" as const;

export const PLUGINS_PLUGIN_REGISTRY_PURPOSE =
  "Maintain conceptual registry of registered Plugins (visibility SSOT)" as const;

export const PLUGINS_PLUGIN_REGISTRY_PRIMARY_RESPONSIBILITY =
  "Authoritative registry surface for Plugin Identity visibility" as const;

/** Registry is not a Public Plugin Contract surface unless later designated (P4). */
export const PLUGINS_PLUGIN_REGISTRY_IS_PUBLIC_EXTENSIBILITY_SURFACE =
  false as const;

export const PLUGINS_PLUGIN_REGISTRY_OWNS_EXTENSION_POINTS = false as const;

export type PluginsPluginRegistryIdentity = {
  readonly componentId: typeof PLUGINS_PLUGIN_REGISTRY_COMPONENT_ID;
  readonly name: typeof PLUGINS_PLUGIN_REGISTRY_NAME;
  readonly purpose: typeof PLUGINS_PLUGIN_REGISTRY_PURPOSE;
  readonly isPublicExtensibilitySurface: typeof PLUGINS_PLUGIN_REGISTRY_IS_PUBLIC_EXTENSIBILITY_SURFACE;
  readonly ownsExtensionPoints: typeof PLUGINS_PLUGIN_REGISTRY_OWNS_EXTENSION_POINTS;
};

export const PLUGINS_PLUGIN_REGISTRY_IDENTITY: PluginsPluginRegistryIdentity = {
  componentId: PLUGINS_PLUGIN_REGISTRY_COMPONENT_ID,
  name: PLUGINS_PLUGIN_REGISTRY_NAME,
  purpose: PLUGINS_PLUGIN_REGISTRY_PURPOSE,
  isPublicExtensibilitySurface:
    PLUGINS_PLUGIN_REGISTRY_IS_PUBLIC_EXTENSIBILITY_SURFACE,
  ownsExtensionPoints: PLUGINS_PLUGIN_REGISTRY_OWNS_EXTENSION_POINTS,
};
