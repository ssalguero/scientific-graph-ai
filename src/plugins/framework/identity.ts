/**
 * PLUGINS-I1 — Extension Framework identity (C1).
 *
 * Authority: PLUGINS-P3 Component Inventory · PLUGINS-P0 / Charter.
 * Orchestration nexus only — never owns peer Extension Points or peer logic.
 */

export const PLUGINS_EXTENSION_FRAMEWORK_COMPONENT_ID =
  "C1_ExtensionFramework" as const;

export const PLUGINS_EXTENSION_FRAMEWORK_NAME = "Extension Framework" as const;

export const PLUGINS_EXTENSION_FRAMEWORK_PURPOSE =
  "Provide the conceptual nexus of PLUGINS integration governance" as const;

export const PLUGINS_EXTENSION_FRAMEWORK_PRIMARY_RESPONSIBILITY =
  "Coordinate collaboration among PLUGINS conceptual services without owning peer logic" as const;

/** Constitutional ownership flags (Charter / P0 / P1). */
export const PLUGINS_EXTENSION_FRAMEWORK_OWNS_EXTENSION_POINTS = false as const;

export const PLUGINS_EXTENSION_FRAMEWORK_OWNS_PEER_LOGIC = false as const;

export const PLUGINS_EXTENSION_FRAMEWORK_ORCHESTRATION_ONLY = true as const;

export type PluginsExtensionFrameworkIdentity = {
  readonly componentId: typeof PLUGINS_EXTENSION_FRAMEWORK_COMPONENT_ID;
  readonly name: typeof PLUGINS_EXTENSION_FRAMEWORK_NAME;
  readonly purpose: typeof PLUGINS_EXTENSION_FRAMEWORK_PURPOSE;
  readonly ownsExtensionPoints: typeof PLUGINS_EXTENSION_FRAMEWORK_OWNS_EXTENSION_POINTS;
  readonly ownsPeerLogic: typeof PLUGINS_EXTENSION_FRAMEWORK_OWNS_PEER_LOGIC;
  readonly orchestrationOnly: typeof PLUGINS_EXTENSION_FRAMEWORK_ORCHESTRATION_ONLY;
};

export const PLUGINS_EXTENSION_FRAMEWORK_IDENTITY: PluginsExtensionFrameworkIdentity =
  {
    componentId: PLUGINS_EXTENSION_FRAMEWORK_COMPONENT_ID,
    name: PLUGINS_EXTENSION_FRAMEWORK_NAME,
    purpose: PLUGINS_EXTENSION_FRAMEWORK_PURPOSE,
    ownsExtensionPoints: PLUGINS_EXTENSION_FRAMEWORK_OWNS_EXTENSION_POINTS,
    ownsPeerLogic: PLUGINS_EXTENSION_FRAMEWORK_OWNS_PEER_LOGIC,
    orchestrationOnly: PLUGINS_EXTENSION_FRAMEWORK_ORCHESTRATION_ONLY,
  };
