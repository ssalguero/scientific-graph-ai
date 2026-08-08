/**
 * PLUGINS-I0 — Vocabulary type barrel.
 */

export type {
  PluginIdentity,
  PluginVersion,
  CapabilityId,
  PermissionId,
  ExtensionPointRef,
  PublicPluginContractId,
  PluginLifecycleState,
  PluginLifecycleStage,
  PluginsComponentId,
} from "./vocabulary";

export {
  asPluginIdentity,
  asPluginVersion,
  asCapabilityId,
  asPermissionId,
} from "./brands";
