/**
 * PLUGINS-I1 — Extension Framework barrel (package-internal).
 *
 * Structural framework readiness only. Do not import from outside `@/plugins`.
 * No discovery, registration, lifecycle execution, loaders, or plugin runtime.
 */

export {
  PLUGINS_FRAMEWORK_PHASE,
  PLUGINS_FRAMEWORK_STATUS,
} from "./status";
export type { PluginsFrameworkStatus } from "./status";

export {
  PLUGINS_EXTENSION_FRAMEWORK_COMPONENT_ID,
  PLUGINS_EXTENSION_FRAMEWORK_NAME,
  PLUGINS_EXTENSION_FRAMEWORK_PURPOSE,
  PLUGINS_EXTENSION_FRAMEWORK_PRIMARY_RESPONSIBILITY,
  PLUGINS_EXTENSION_FRAMEWORK_OWNS_EXTENSION_POINTS,
  PLUGINS_EXTENSION_FRAMEWORK_OWNS_PEER_LOGIC,
  PLUGINS_EXTENSION_FRAMEWORK_ORCHESTRATION_ONLY,
  PLUGINS_EXTENSION_FRAMEWORK_IDENTITY,
} from "./identity";
export type { PluginsExtensionFrameworkIdentity } from "./identity";

export { PLUGINS_FRAMEWORK_SERVICE_BOUNDARIES } from "./service-boundaries";
export type { PluginsFrameworkServiceBoundary } from "./service-boundaries";

export type { ExtensionDescriptor } from "./extension-descriptor";
export {
  PLUGINS_EXTENSION_DESCRIPTOR_EXECUTABLE,
  PLUGINS_EXTENSION_DESCRIPTOR_REGISTRABLE_IN_I1,
} from "./extension-descriptor";

export { PLUGINS_IMPLEMENTATION_NAMESPACES } from "./namespaces";
export type { PluginsImplementationNamespace } from "./namespaces";

export {
  PLUGINS_FRAMEWORK_OWNERSHIP,
  PLUGINS_PEER_EXTENSION_POINT_OWNERS,
} from "./ownership";
export type {
  PluginsFrameworkOwnership,
  PluginsPeerExtensionPointOwner,
} from "./ownership";

export { composePluginsExtensionFramework } from "./wiring";
export type { PluginsExtensionFrameworkSnapshot } from "./wiring";
