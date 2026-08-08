/**
 * PLUGINS-I0 — Boundary policy (internal).
 *
 * Consumers outside PLUGINS may import ONLY `@/plugins`.
 * Not a consumer API.
 */

/** Consumer-allowed PLUGINS import prefixes (public surface only). */
export const PLUGINS_PUBLIC_IMPORT_PREFIXES = ["@/plugins"] as const;

/**
 * Path segments under `src/plugins/` that are PLUGINS-internal / reserved.
 * Outside the PLUGINS package, importing these via `@/plugins/...` is forbidden.
 */
export const PLUGINS_INTERNAL_FOLDER_SEGMENTS = [
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

/** Forbidden import prefixes for consumers outside PLUGINS. */
export const PLUGINS_FORBIDDEN_CONSUMER_IMPORT_PREFIXES = [
  "@/plugins/internal",
  "@/plugins/foundation",
  "@/plugins/types",
  "@/plugins/abstractions",
  "@/plugins/framework",
  "@/plugins/registry",
  "@/plugins/discovery",
  "@/plugins/registration",
  "@/plugins/admission",
  "@/plugins/capabilities",
  "@/plugins/permissions",
  "@/plugins/capability",
  "@/plugins/contracts",
  "@/plugins/lifecycle",
  "@/plugins/compatibility",
  "@/plugins/validation",
  "@/plugins/diagnostics",
  "@/plugins/observability",
  "@/plugins/integration",
  "@/plugins/certification",
  "@/plugins/sdk",
  "@/plugins/public",
] as const;

/** PLUGINS-I1 — Extension Framework required dirs (relative to src/plugins). */
export const PLUGINS_FRAMEWORK_REQUIRED_DIRS = [
  "framework",
  "framework/wiring",
] as const;

/** PLUGINS-I1 — Extension Framework required files (relative to src/plugins). */
export const PLUGINS_FRAMEWORK_REQUIRED_FILES = [
  "framework/index.ts",
  "framework/status.ts",
  "framework/identity.ts",
  "framework/service-boundaries.ts",
  "framework/extension-descriptor.ts",
  "framework/namespaces.ts",
  "framework/ownership.ts",
  "framework/wiring/index.ts",
  "framework/wiring/compose-framework.ts",
] as const;

/** Symbols allowed to re-export from public barrel for framework phase. */
export const PLUGINS_ALLOWED_PUBLIC_FRAMEWORK_REEXPORTS = [
  "PLUGINS_FRAMEWORK_PHASE",
  "PLUGINS_FRAMEWORK_STATUS",
] as const;

/** PLUGINS-I2 — Registry Infrastructure required dirs (relative to src/plugins). */
export const PLUGINS_REGISTRY_REQUIRED_DIRS = [
  "registry",
  "registry/wiring",
] as const;

/** PLUGINS-I2 — Registry Infrastructure required files (relative to src/plugins). */
export const PLUGINS_REGISTRY_REQUIRED_FILES = [
  "registry/index.ts",
  "registry/status.ts",
  "registry/identity.ts",
  "registry/ownership.ts",
  "registry/namespaces.ts",
  "registry/state.ts",
  "registry/descriptors.ts",
  "registry/metadata.ts",
  "registry/wiring/index.ts",
  "registry/wiring/compose-registry.ts",
] as const;

/** Symbols allowed to re-export from public barrel for registry phase. */
export const PLUGINS_ALLOWED_PUBLIC_REGISTRY_REEXPORTS = [
  "PLUGINS_REGISTRY_PHASE",
  "PLUGINS_REGISTRY_STATUS",
] as const;

/** PLUGINS-I3 — Discovery required dirs (relative to src/plugins). */
export const PLUGINS_DISCOVERY_REQUIRED_DIRS = [
  "discovery",
  "discovery/wiring",
] as const;

/** PLUGINS-I3 — Discovery required files (relative to src/plugins). */
export const PLUGINS_DISCOVERY_REQUIRED_FILES = [
  "discovery/index.ts",
  "discovery/status.ts",
  "discovery/identity.ts",
  "discovery/descriptors.ts",
  "discovery/state.ts",
  "discovery/diagnostics.ts",
  "discovery/discover.ts",
  "discovery/wiring/index.ts",
  "discovery/wiring/compose-discovery.ts",
] as const;

/** PLUGINS-I3 — Registration required dirs (relative to src/plugins). */
export const PLUGINS_REGISTRATION_REQUIRED_DIRS = [
  "registration",
  "registration/wiring",
] as const;

/** PLUGINS-I3 — Registration required files (relative to src/plugins). */
export const PLUGINS_REGISTRATION_REQUIRED_FILES = [
  "registration/index.ts",
  "registration/status.ts",
  "registration/identity.ts",
  "registration/descriptors.ts",
  "registration/state.ts",
  "registration/diagnostics.ts",
  "registration/register.ts",
  "registration/wiring/index.ts",
  "registration/wiring/compose-registration.ts",
] as const;

/** PLUGINS-I3 — Registry mutation path files (relative to src/plugins). */
export const PLUGINS_REGISTRY_I3_REQUIRED_FILES = [
  "registry/store.ts",
  "registry/registration-service.ts",
] as const;

/** Symbols allowed to re-export from public barrel for I3 admission. */
export const PLUGINS_ALLOWED_PUBLIC_ADMISSION_REEXPORTS = [
  "PLUGINS_DISCOVERY_PHASE",
  "PLUGINS_DISCOVERY_STATUS",
  "PLUGINS_REGISTRATION_PHASE",
  "PLUGINS_REGISTRATION_STATUS",
  "PLUGINS_ADMISSION_PHASE",
  "PLUGINS_ADMISSION_STATUS",
] as const;

/** PLUGINS-I4 — Capabilities required dirs (relative to src/plugins). */
export const PLUGINS_CAPABILITIES_REQUIRED_DIRS = [
  "capabilities",
  "capabilities/wiring",
] as const;

/** PLUGINS-I4 — Capabilities required files (relative to src/plugins). */
export const PLUGINS_CAPABILITIES_REQUIRED_FILES = [
  "capabilities/index.ts",
  "capabilities/status.ts",
  "capabilities/identity.ts",
  "capabilities/descriptors.ts",
  "capabilities/state.ts",
  "capabilities/diagnostics.ts",
  "capabilities/evaluate.ts",
  "capabilities/wiring/index.ts",
  "capabilities/wiring/compose-capabilities.ts",
] as const;

/** PLUGINS-I4 — Permissions required dirs (relative to src/plugins). */
export const PLUGINS_PERMISSIONS_REQUIRED_DIRS = [
  "permissions",
  "permissions/wiring",
] as const;

/** PLUGINS-I4 — Permissions required files (relative to src/plugins). */
export const PLUGINS_PERMISSIONS_REQUIRED_FILES = [
  "permissions/index.ts",
  "permissions/status.ts",
  "permissions/identity.ts",
  "permissions/descriptors.ts",
  "permissions/state.ts",
  "permissions/diagnostics.ts",
  "permissions/evaluate.ts",
  "permissions/wiring/index.ts",
  "permissions/wiring/compose-permissions.ts",
] as const;

/** PLUGINS-I4 — Registry read-view (relative to src/plugins). */
export const PLUGINS_REGISTRY_I4_REQUIRED_FILES = [
  "registry/read-view.ts",
] as const;

/** Symbols allowed to re-export from public barrel for I4 capability layer. */
export const PLUGINS_ALLOWED_PUBLIC_CAPABILITY_REEXPORTS = [
  "PLUGINS_CAPABILITIES_PHASE",
  "PLUGINS_CAPABILITIES_STATUS",
  "PLUGINS_PERMISSIONS_PHASE",
  "PLUGINS_PERMISSIONS_STATUS",
  "PLUGINS_CAPABILITY_PHASE",
  "PLUGINS_CAPABILITY_STATUS",
] as const;

/** PLUGINS-I5 — Public Contracts required dirs (relative to src/plugins). */
export const PLUGINS_CONTRACTS_REQUIRED_DIRS = [
  "contracts",
  "contracts/wiring",
] as const;

/** PLUGINS-I5 — Public Contracts required files (relative to src/plugins). */
export const PLUGINS_CONTRACTS_REQUIRED_FILES = [
  "contracts/index.ts",
  "contracts/status.ts",
  "contracts/identity.ts",
  "contracts/catalog.ts",
  "contracts/descriptors.ts",
  "contracts/views.ts",
  "contracts/diagnostics.ts",
  "contracts/adapter.ts",
  "contracts/wiring/index.ts",
  "contracts/wiring/compose-contracts.ts",
] as const;

/** Symbols allowed to re-export from public barrel for I5 contracts. */
export const PLUGINS_ALLOWED_PUBLIC_CONTRACT_REEXPORTS = [
  "PLUGINS_CONTRACTS_PHASE",
  "PLUGINS_CONTRACTS_STATUS",
] as const;

/** Types that must NEVER appear in public contract views / public barrel. */
export const PLUGINS_FORBIDDEN_PUBLIC_CONTRACT_TYPE_NAMES = [
  "PluginRegistryState",
  "PluginRegistryEntry",
  "PluginRegistryReadView",
  "PluginRegistryRegistrationService",
  "PluginsRegistryInfrastructureSnapshot",
  "PluginsExtensionFrameworkSnapshot",
] as const;

/** PLUGINS-I6 — Lifecycle required dirs (relative to src/plugins). */
export const PLUGINS_LIFECYCLE_REQUIRED_DIRS = [
  "lifecycle",
  "lifecycle/wiring",
] as const;

/** PLUGINS-I6 — Lifecycle required files (relative to src/plugins). */
export const PLUGINS_LIFECYCLE_REQUIRED_FILES = [
  "lifecycle/index.ts",
  "lifecycle/status.ts",
  "lifecycle/identity.ts",
  "lifecycle/descriptors.ts",
  "lifecycle/state.ts",
  "lifecycle/transitions.ts",
  "lifecycle/diagnostics.ts",
  "lifecycle/controller.ts",
  "lifecycle/wiring/index.ts",
  "lifecycle/wiring/compose-lifecycle.ts",
] as const;

/** Symbols allowed to re-export from public barrel for I6 lifecycle. */
export const PLUGINS_ALLOWED_PUBLIC_LIFECYCLE_REEXPORTS = [
  "PLUGINS_LIFECYCLE_PHASE",
  "PLUGINS_LIFECYCLE_STATUS",
] as const;

/** Path fragments Lifecycle must never reference (Registry isolation). */
export const PLUGINS_LIFECYCLE_FORBIDDEN_IMPORT_FRAGMENTS = [
  "registry/store",
  "registry/registration-service",
  "registry/state",
  "registry/read-view",
  "capabilities/evaluate",
  "permissions/evaluate",
  "framework/wiring",
] as const;

/** PLUGINS-I7 — Compatibility required dirs (relative to src/plugins). */
export const PLUGINS_COMPATIBILITY_REQUIRED_DIRS = [
  "compatibility",
  "compatibility/wiring",
] as const;

/** PLUGINS-I7 — Compatibility required files (relative to src/plugins). */
export const PLUGINS_COMPATIBILITY_REQUIRED_FILES = [
  "compatibility/index.ts",
  "compatibility/status.ts",
  "compatibility/identity.ts",
  "compatibility/descriptors.ts",
  "compatibility/report.ts",
  "compatibility/diagnostics.ts",
  "compatibility/evaluate.ts",
  "compatibility/wiring/index.ts",
  "compatibility/wiring/compose-compatibility.ts",
] as const;

/** PLUGINS-I7 — Validation required dirs (relative to src/plugins). */
export const PLUGINS_VALIDATION_REQUIRED_DIRS = [
  "validation",
  "validation/wiring",
] as const;

/** PLUGINS-I7 — Validation required files (relative to src/plugins). */
export const PLUGINS_VALIDATION_REQUIRED_FILES = [
  "validation/index.ts",
  "validation/status.ts",
  "validation/identity.ts",
  "validation/descriptors.ts",
  "validation/report.ts",
  "validation/diagnostics.ts",
  "validation/certify.ts",
  "validation/wiring/index.ts",
  "validation/wiring/compose-validation.ts",
] as const;

/** Symbols allowed to re-export from public barrel for I7. */
export const PLUGINS_ALLOWED_PUBLIC_VALIDATION_REEXPORTS = [
  "PLUGINS_COMPATIBILITY_PHASE",
  "PLUGINS_COMPATIBILITY_STATUS",
  "PLUGINS_VALIDATION_PHASE",
  "PLUGINS_VALIDATION_STATUS",
] as const;

/** Path fragments Compatibility/Validation must never reference. */
export const PLUGINS_I7_FORBIDDEN_IMPORT_FRAGMENTS = [
  "registry/store",
  "registry/registration-service",
  "registry/state",
  "registry/read-view",
  "capabilities/evaluate",
  "permissions/evaluate",
  "lifecycle/controller",
  "framework/wiring",
] as const;

/** PLUGINS-I8 — Diagnostics required dirs. */
export const PLUGINS_DIAGNOSTICS_REQUIRED_DIRS = [
  "diagnostics",
  "diagnostics/wiring",
] as const;

/** PLUGINS-I8 — Diagnostics required files. */
export const PLUGINS_DIAGNOSTICS_REQUIRED_FILES = [
  "diagnostics/index.ts",
  "diagnostics/status.ts",
  "diagnostics/identity.ts",
  "diagnostics/descriptors.ts",
  "diagnostics/models.ts",
  "diagnostics/metadata.ts",
  "diagnostics/adapters.ts",
  "diagnostics/collect.ts",
  "diagnostics/wiring/index.ts",
  "diagnostics/wiring/compose-diagnostics.ts",
] as const;

/** PLUGINS-I8 — Observability required dirs. */
export const PLUGINS_OBSERVABILITY_REQUIRED_DIRS = [
  "observability",
  "observability/wiring",
] as const;

/** PLUGINS-I8 — Observability required files. */
export const PLUGINS_OBSERVABILITY_REQUIRED_FILES = [
  "observability/index.ts",
  "observability/status.ts",
  "observability/identity.ts",
  "observability/descriptors.ts",
  "observability/aggregate.ts",
  "observability/wiring/index.ts",
  "observability/wiring/compose-observability.ts",
] as const;

/** Symbols allowed on public barrel for I8. */
export const PLUGINS_ALLOWED_PUBLIC_DIAGNOSTICS_REEXPORTS = [
  "PLUGINS_DIAGNOSTICS_PHASE",
  "PLUGINS_DIAGNOSTICS_STATUS",
  "PLUGINS_OBSERVABILITY_PHASE",
  "PLUGINS_OBSERVABILITY_STATUS",
] as const;

/** Path fragments Diagnostics/Observability must never reference. */
export const PLUGINS_I8_FORBIDDEN_IMPORT_FRAGMENTS = [
  "registry/store",
  "registry/registration-service",
  "capabilities/evaluate",
  "permissions/evaluate",
  "lifecycle/controller",
  "compatibility/evaluate",
  "validation/certify",
  "framework/wiring",
] as const;

/** PLUGINS-I9 — Platform Integration required dirs. */
export const PLUGINS_INTEGRATION_REQUIRED_DIRS = [
  "integration",
  "integration/adapters",
  "integration/wiring",
] as const;

/** PLUGINS-I9 — Platform Integration required files. */
export const PLUGINS_INTEGRATION_REQUIRED_FILES = [
  "integration/index.ts",
  "integration/status.ts",
  "integration/identity.ts",
  "integration/peers.ts",
  "integration/descriptors.ts",
  "integration/registry.ts",
  "integration/resolver.ts",
  "integration/views.ts",
  "integration/diagnostics.ts",
  "integration/adapters/index.ts",
  "integration/adapters/engine.ts",
  "integration/adapters/data.ts",
  "integration/adapters/ai.ts",
  "integration/adapters/ux.ts",
  "integration/adapters/collab.ts",
  "integration/wiring/index.ts",
  "integration/wiring/compose-integration.ts",
] as const;

/** Symbols allowed on public barrel for I9. */
export const PLUGINS_ALLOWED_PUBLIC_INTEGRATION_REEXPORTS = [
  "PLUGINS_INTEGRATION_PHASE",
  "PLUGINS_INTEGRATION_STATUS",
] as const;

/**
 * Path fragments Integration must never reference.
 * Peer internals and peer package deep imports are constitutionally forbidden.
 */
export const PLUGINS_I9_FORBIDDEN_IMPORT_FRAGMENTS = [
  "registry/store",
  "registry/registration-service",
  "capabilities/evaluate",
  "permissions/evaluate",
  "lifecycle/controller",
  "compatibility/evaluate",
  "validation/certify",
  "framework/wiring",
  "@/engine/internal",
  "@/data/internal",
  "@/ai/internal",
  "@/ux/internal",
  "@/collab/internal",
  "engine/internal",
  "data/internal",
  "ai/internal",
  "ux/internal",
  "collab/internal",
  "@/engine/orchestration",
  "@/data/repository",
  "@/data/integration",
  "getIntegrationLayer",
] as const;

/** Peer package import prefixes Integration must never use (no peer implementation coupling). */
export const PLUGINS_I9_FORBIDDEN_PEER_IMPORT_PREFIXES = [
  "@/engine",
  "@/data",
  "@/ai",
  "@/ux",
  "@/collab",
  "src/engine",
  "src/data",
  "src/ai",
  "src/ux",
  "src/collab",
] as const;

/** PLUGINS-I10 — Certification package required dirs. */
export const PLUGINS_CERTIFICATION_REQUIRED_DIRS = ["certification"] as const;

/** PLUGINS-I10 — Certification package required files. */
export const PLUGINS_CERTIFICATION_REQUIRED_FILES = [
  "certification/index.ts",
  "certification/status.ts",
  "certification/README.md",
  "certification/CERTIFICATION.md",
  "certification/CERTIFICATION_SUMMARY.md",
  "certification/CONSOLIDATED_VALIDATION.md",
  "certification/ARCHITECTURE_COMPLIANCE.md",
  "certification/OWNERSHIP_COMPLIANCE.md",
  "certification/DOCUMENTATION_REVIEW.md",
  "certification/PRODUCTION_READINESS.md",
  "certification/EVIDENCE_INDEX.md",
  "certification/EVIDENCE_REVIEW.md",
  "certification/DOMAIN_COMPLETION.md",
] as const;

/** Symbols allowed on public barrel for I10. */
export const PLUGINS_ALLOWED_PUBLIC_CERTIFICATION_REEXPORTS = [
  "PLUGINS_CERTIFICATION_PHASE",
  "PLUGINS_CERTIFICATION_STATUS",
  "PLUGINS_DOMAIN_STATUS",
  "PLUGINS_IMPLEMENTATION_SERIES_CLOSED",
] as const;
