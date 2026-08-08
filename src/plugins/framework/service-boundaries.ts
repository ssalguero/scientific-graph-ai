/**
 * PLUGINS-I1 — Framework service boundaries (structural catalog).
 *
 * Lists inventory services the Extension Framework coordinates conceptually.
 * Does NOT implement those services (deferred to I2–I9 / C12).
 *
 * Authority: PLUGINS-P3 · PLUGINS-P6.
 */

export const PLUGINS_FRAMEWORK_SERVICE_BOUNDARIES = [
  {
    id: "C2_PluginRegistry",
    layer: "registry",
    phase: "PLUGINS-I2",
    implementedInFramework: false,
  },
  {
    id: "C3_DiscoveryService",
    layer: "discovery",
    phase: "PLUGINS-I3",
    implementedInFramework: false,
  },
  {
    id: "C4_RegistrationService",
    layer: "registration",
    phase: "PLUGINS-I3",
    implementedInFramework: false,
  },
  {
    id: "C5_LifecycleCoordinator",
    layer: "lifecycle",
    phase: "PLUGINS-I6",
    implementedInFramework: false,
  },
  {
    id: "C6_CapabilityManager",
    layer: "capabilities",
    phase: "PLUGINS-I4",
    implementedInFramework: false,
  },
  {
    id: "C7_PermissionManager",
    layer: "permissions",
    phase: "PLUGINS-I4",
    implementedInFramework: false,
  },
  {
    id: "C8_CompatibilityValidator",
    layer: "compatibility",
    phase: "PLUGINS-I7",
    implementedInFramework: false,
  },
  {
    id: "C9_DiagnosticsService",
    layer: "diagnostics",
    phase: "PLUGINS-I8",
    implementedInFramework: false,
  },
  {
    id: "C10_ExtensionPointResolver",
    layer: "integration",
    phase: "PLUGINS-I5_to_I9",
    implementedInFramework: false,
  },
  {
    id: "C11_ManifestInterpreter",
    layer: "admission",
    phase: "PLUGINS-I3",
    implementedInFramework: false,
  },
  {
    id: "C12_FuturePublicSdkBoundary",
    layer: "sdk",
    phase: "RESERVED",
    implementedInFramework: false,
  },
] as const;

export type PluginsFrameworkServiceBoundary =
  (typeof PLUGINS_FRAMEWORK_SERVICE_BOUNDARIES)[number];
