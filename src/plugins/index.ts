/**
 * PLUGINS Domain — Public barrel.
 *
 * Consumers may import ONLY from `@/plugins`.
 * Do not import foundation/, types/, abstractions/, framework/, internal/, or reserved layers.
 *
 * PLUGINS-I0…I10: status markers only (no collect / aggregate / decision APIs on public barrel).
 *
 * @packageDocumentation
 */

export {
  PLUGINS_DOMAIN_ID,
  PLUGINS_DOMAIN_NAME,
  PLUGINS_DOMAIN_ARCHITECTURAL_ROLE,
  PLUGINS_DOMAIN_MOTTO,
  PLUGINS_FOUNDATION_PHASE,
  PLUGINS_FOUNDATION_STATUS,
} from "./foundation";

export type {
  PluginsFoundationIdentity,
  PluginsFoundationStatus,
} from "./foundation";

export {
  PLUGINS_FRAMEWORK_PHASE,
  PLUGINS_FRAMEWORK_STATUS,
} from "./framework/status";

export type { PluginsFrameworkStatus } from "./framework/status";

export {
  PLUGINS_REGISTRY_PHASE,
  PLUGINS_REGISTRY_STATUS,
} from "./registry/status";

export type { PluginsRegistryStatus } from "./registry/status";

export {
  PLUGINS_DISCOVERY_PHASE,
  PLUGINS_DISCOVERY_STATUS,
} from "./discovery/status";

export type { PluginsDiscoveryStatus } from "./discovery/status";

export {
  PLUGINS_REGISTRATION_PHASE,
  PLUGINS_REGISTRATION_STATUS,
} from "./registration/status";

export type { PluginsRegistrationStatus } from "./registration/status";

export {
  PLUGINS_ADMISSION_PHASE,
  PLUGINS_ADMISSION_STATUS,
} from "./admission";

export type { PluginsAdmissionStatus } from "./admission";

export {
  PLUGINS_CAPABILITIES_PHASE,
  PLUGINS_CAPABILITIES_STATUS,
} from "./capabilities/status";

export type { PluginsCapabilitiesStatus } from "./capabilities/status";

export {
  PLUGINS_PERMISSIONS_PHASE,
  PLUGINS_PERMISSIONS_STATUS,
} from "./permissions/status";

export type { PluginsPermissionsStatus } from "./permissions/status";

export {
  PLUGINS_CAPABILITY_PHASE,
  PLUGINS_CAPABILITY_STATUS,
} from "./capability";

export type { PluginsCapabilityLayerStatus } from "./capability";

export {
  PLUGINS_CONTRACTS_PHASE,
  PLUGINS_CONTRACTS_STATUS,
} from "./contracts/status";

export type { PluginsContractsStatus } from "./contracts/status";

export {
  PLUGINS_LIFECYCLE_PHASE,
  PLUGINS_LIFECYCLE_STATUS,
} from "./lifecycle/status";

export type { PluginsLifecycleStatus } from "./lifecycle/status";

export {
  PLUGINS_COMPATIBILITY_PHASE,
  PLUGINS_COMPATIBILITY_STATUS,
} from "./compatibility/status";

export type { PluginsCompatibilityStatus } from "./compatibility/status";

export {
  PLUGINS_VALIDATION_PHASE,
  PLUGINS_VALIDATION_STATUS,
} from "./validation/status";

export type { PluginsValidationStatus } from "./validation/status";

export {
  PLUGINS_DIAGNOSTICS_PHASE,
  PLUGINS_DIAGNOSTICS_STATUS,
} from "./diagnostics/status";

export type { PluginsDiagnosticsStatus } from "./diagnostics/status";

export {
  PLUGINS_OBSERVABILITY_PHASE,
  PLUGINS_OBSERVABILITY_STATUS,
} from "./observability/status";

export type { PluginsObservabilityStatus } from "./observability/status";

export {
  PLUGINS_INTEGRATION_PHASE,
  PLUGINS_INTEGRATION_STATUS,
} from "./integration/status";

export type { PluginsIntegrationStatus } from "./integration/status";

export {
  PLUGINS_CERTIFICATION_PHASE,
  PLUGINS_CERTIFICATION_STATUS,
  PLUGINS_DOMAIN_STATUS,
  PLUGINS_IMPLEMENTATION_SERIES_CLOSED,
} from "./certification/status";

export type {
  PluginsCertificationStatus,
  PluginsDomainStatus,
} from "./certification/status";
