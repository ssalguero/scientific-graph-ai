/**
 * PLUGINS-I0 — Canonical vocabulary types (PLUGINS-P2 Functional Freeze).
 *
 * Type markers only. No runtime evaluation, registration, or lifecycle execution.
 */

/** Stable conceptual identity of a Plugin (PLUGINS-P2). */
export type PluginIdentity = string & { readonly __brand: "PluginIdentity" };

/** Conceptual version designation of a Plugin (PLUGINS-P2). */
export type PluginVersion = string & { readonly __brand: "PluginVersion" };

/** Declared unit of permitted contribution or access (PLUGINS-P2). */
export type CapabilityId = string & { readonly __brand: "CapabilityId" };

/** Conceptual authorization attribute (PLUGINS-P2). Rules deferred to later I\*. */
export type PermissionId = string & { readonly __brand: "PermissionId" };

/**
 * Peer-owned extension point reference id.
 * Extension Points are owned by peer domains (Charter EP Ownership Freeze).
 * PLUGINS never owns Extension Point internals.
 */
export type ExtensionPointRef = string & {
  readonly __brand: "ExtensionPointRef";
};

/** Designated Public Plugin Contract version id (PLUGINS-P4). Schemas deferred to I5+. */
export type PublicPluginContractId = string & {
  readonly __brand: "PublicPluginContractId";
};

/** Conceptual lifecycle states (PLUGINS-P5). No state machine in I0. */
export type PluginLifecycleState =
  | "Discovered"
  | "Validated"
  | "Registered"
  | "Active"
  | "Inactive"
  | "Suspended"
  | "Updating"
  | "Invalid"
  | "Removed";

/** Conceptual lifecycle stages (PLUGINS-P5). No execution in I0. */
export type PluginLifecycleStage =
  | "Discovery"
  | "Validation"
  | "CompatibilityCheck"
  | "Registration"
  | "CapabilityValidation"
  | "Activation"
  | "Execution"
  | "Monitoring"
  | "Suspension"
  | "Update"
  | "Revalidation"
  | "Reactivation"
  | "Deactivation"
  | "Removal";

/** Inventory component ids (PLUGINS-P3). Conceptual stewardship only. */
export type PluginsComponentId =
  | "C1_ExtensionFramework"
  | "C2_PluginRegistry"
  | "C3_DiscoveryService"
  | "C4_RegistrationService"
  | "C5_LifecycleCoordinator"
  | "C6_CapabilityManager"
  | "C7_PermissionManager"
  | "C8_CompatibilityValidator"
  | "C9_DiagnosticsService"
  | "C10_ExtensionPointResolver"
  | "C11_ManifestInterpreter"
  | "C12_FuturePublicSdkBoundary";
