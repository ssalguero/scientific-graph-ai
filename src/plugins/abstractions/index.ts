/**
 * PLUGINS-I0 — Conceptual abstractions barrel (type markers only).
 * No runtime behavior.
 */

export type {
  PluginRegistryAbstraction,
  CapabilityRegistryAbstraction,
  ExtensionPointRegistryAbstraction,
} from "./registry";

export type {
  LifecycleCoordinatorAbstraction,
  LifecycleVocabularyMarker,
} from "./lifecycle";

export type {
  CapabilityManagerAbstraction,
  PermissionManagerAbstraction,
} from "./capability";

export type {
  PublicPluginContractAbstraction,
  PublicContractSurfaceClass,
  NonExtensibleSurfaceMarker,
} from "./contracts";

export type {
  DiagnosticsServiceAbstraction,
  ExtensionPointResolverAbstraction,
  FuturePublicSdkBoundaryAbstraction,
} from "./diagnostics";

/** Extension Framework nexus marker (C1) — behavior in PLUGINS-I1. */
export type ExtensionFrameworkAbstraction = {
  readonly __abstraction: "ExtensionFramework";
  readonly __implements: "C1";
  readonly __phase: "PLUGINS-I1";
};
