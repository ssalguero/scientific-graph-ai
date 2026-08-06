/**
 * AI-I1 — Boundary enforcement policy (AI-internal).
 *
 * OWNERSHIP: SSOT for allowlists / forbidden surfaces used by
 * `scripts/validate-ai-boundaries.ts` and `scripts/validate-ai-infrastructure.ts`.
 *
 * Not a consumer API — do not import from ENGINE / DATA / UX.
 *
 * @packageDocumentation
 */

/** Consumer-allowed AI import prefixes (public surface only). */
export const AI_PUBLIC_IMPORT_PREFIXES = ["@/ai"] as const;

/**
 * Path segments under `src/ai/` that are AI-internal / reserved.
 * Outside `src/ai/**`, importing these via `@/ai/...` is forbidden.
 */
export const AI_INTERNAL_FOLDER_SEGMENTS = [
  "foundation",
  "identity",
  "core",
  "supporting",
  "governance",
  "extension",
  "infrastructure",
  "integration",
  "hardening",
  "certification",
  "public",
  "internal",
] as const;

/** Forbidden import prefixes for consumers outside AI. */
export const AI_FORBIDDEN_CONSUMER_IMPORT_PREFIXES = [
  "@/ai/internal",
  "@/ai/foundation",
  "@/ai/public",
  "@/ai/identity",
  "@/ai/core",
  "@/ai/supporting",
  "@/ai/governance",
  "@/ai/extension",
  "@/ai/infrastructure",
  "@/ai/integration",
  "@/ai/hardening",
  "@/ai/certification",
  "src/ai/internal",
  "src/ai/foundation",
  "src/ai/core",
  "src/ai/identity",
  "src/ai/infrastructure",
  "src/ai/integration",
  "src/ai/hardening",
  "src/ai/certification",
] as const;

/**
 * Public barrel (`src/ai/index.ts`) must never re-export these roots.
 * Narrow exceptions: `./infrastructure/status`, `./core/status` (phase markers only).
 */
export const AI_FORBIDDEN_PUBLIC_REEXPORT_PREFIXES = [
  "./internal",
  "./infrastructure/registration",
  "./infrastructure/wiring",
  "./infrastructure/index",
  "./infrastructure/exposure-boundary",
  "./infrastructure/coordination-boundary",
  "./infrastructure/contract-classification",
  "./infrastructure/namespaces",
  "./identity",
  "./core/index",
  "./core/intelligence-generation",
  "./core/scientific-grounding",
  "./core/capability-registry",
  "./core/wiring",
  "./core/contextual-assistance/index",
  "./core/contextual-assistance/assistance",
  "./core/contextual-assistance/recommendation",
  "./core/contextual-assistance/explanation",
  "./core/contextual-assistance/registration",
  "./core/contextual-assistance/compose-contextual",
  "./core/analytical-interpretation",
  "./core/workflow-guidance",
  "./core/compose-core-capabilities",
  "./supporting/index",
  "./supporting/assistance-context",
  "./supporting/capability-catalog",
  "./supporting/assumption-confidence",
  "./supporting/registration",
  "./supporting/compose-supporting",
  "./governance/index",
  "./governance/capability-governance",
  "./governance/non-authoritative-guard",
  "./governance/optionality-preservation",
  "./governance/registration",
  "./governance/compose-governance",
  "./integration/index",
  "./integration/data-integration",
  "./integration/engine-integration",
  "./integration/ux-integration",
  "./integration/coordination",
  "./integration/exposure",
  "./integration/registration",
  "./integration/compose-integration",
  "./extension/index",
  "./extension/specialized-assistants",
  "./extension/discipline-specific",
  "./extension/predictive-assistance",
  "./extension/registration",
  "./extension/compose-extension",
  "./hardening/index",
  "./hardening/quality-gates",
  "./certification/index",
] as const;

/** Allowed phase-marker re-exports from public barrel. */
export const AI_ALLOWED_PUBLIC_INFRASTRUCTURE_REEXPORTS = [
  "./infrastructure/status",
] as const;

export const AI_ALLOWED_PUBLIC_CORE_REEXPORTS = [
  "./core/status",
  "./core/contextual-assistance/status",
  "./core/core-capabilities-status",
] as const;

export const AI_ALLOWED_PUBLIC_SUPPORTING_REEXPORTS = [
  "./supporting/status",
] as const;

export const AI_ALLOWED_PUBLIC_GOVERNANCE_REEXPORTS = [
  "./governance/status",
] as const;

export const AI_ALLOWED_PUBLIC_INTEGRATION_REEXPORTS = [
  "./integration/status",
] as const;

export const AI_ALLOWED_PUBLIC_EXTENSION_REEXPORTS = [
  "./extension/status",
] as const;

export const AI_ALLOWED_PUBLIC_HARDENING_REEXPORTS = [
  "./hardening/status",
] as const;

export const AI_ALLOWED_PUBLIC_CERTIFICATION_REEXPORTS = [
  "./certification/status",
] as const;

/** ENGINE/DATA internals AI must never import. */
export const AI_FORBIDDEN_FOREIGN_INTERNAL_PREFIXES = [
  "@/engine/internal",
  "@/data/internal",
  "@/data/metadata",
  "@/data/processing",
  "@/data/repository",
  "@/data/validation",
  "@/data/model",
  "@/data/integration",
] as const;

/** Required core layout dirs (AI-I2…AI-I4). */
export const AI_CORE_REQUIRED_DIRS = [
  "core",
  "core/intelligence-generation",
  "core/scientific-grounding",
  "core/capability-registry",
  "core/wiring",
  "core/contextual-assistance",
  "core/contextual-assistance/assistance",
  "core/contextual-assistance/recommendation",
  "core/contextual-assistance/explanation",
  "core/contextual-assistance/registration",
  "core/analytical-interpretation",
  "core/workflow-guidance",
] as const;

/** Required core files (AI-I2…AI-I4). */
export const AI_CORE_REQUIRED_FILES = [
  "core/index.ts",
  "core/status.ts",
  "core/core-capabilities-status.ts",
  "core/compose-core-capabilities.ts",
  "core/intelligence-generation/index.ts",
  "core/intelligence-generation/identity.ts",
  "core/intelligence-generation/lifecycle.ts",
  "core/scientific-grounding/index.ts",
  "core/scientific-grounding/identity.ts",
  "core/scientific-grounding/derivation.ts",
  "core/capability-registry/index.ts",
  "core/capability-registry/registry.ts",
  "core/wiring/index.ts",
  "core/wiring/compose-core.ts",
  "core/contextual-assistance/index.ts",
  "core/contextual-assistance/status.ts",
  "core/contextual-assistance/compose-contextual.ts",
  "core/contextual-assistance/assistance/index.ts",
  "core/contextual-assistance/assistance/identity.ts",
  "core/contextual-assistance/assistance/lifecycle.ts",
  "core/contextual-assistance/recommendation/index.ts",
  "core/contextual-assistance/recommendation/identity.ts",
  "core/contextual-assistance/recommendation/lifecycle.ts",
  "core/contextual-assistance/explanation/index.ts",
  "core/contextual-assistance/explanation/identity.ts",
  "core/contextual-assistance/explanation/lifecycle.ts",
  "core/contextual-assistance/registration/index.ts",
  "core/contextual-assistance/registration/registry.ts",
  "core/analytical-interpretation/index.ts",
  "core/analytical-interpretation/identity.ts",
  "core/analytical-interpretation/lifecycle.ts",
  "core/workflow-guidance/index.ts",
  "core/workflow-guidance/identity.ts",
  "core/workflow-guidance/lifecycle.ts",
] as const;

/** Required AI-I4 dirs. */
export const AI_I4_REQUIRED_DIRS = [
  "core/analytical-interpretation",
  "core/workflow-guidance",
] as const;

/** Required AI-I3 contextual dirs. */
export const AI_CONTEXTUAL_REQUIRED_DIRS = [
  "core/contextual-assistance",
  "core/contextual-assistance/assistance",
  "core/contextual-assistance/recommendation",
  "core/contextual-assistance/explanation",
  "core/contextual-assistance/registration",
] as const;

/** Required AI-I5 supporting dirs. */
export const AI_SUPPORTING_REQUIRED_DIRS = [
  "supporting",
  "supporting/assistance-context",
  "supporting/capability-catalog",
  "supporting/assumption-confidence",
  "supporting/registration",
] as const;

/** Required AI-I5 supporting files. */
export const AI_SUPPORTING_REQUIRED_FILES = [
  "supporting/index.ts",
  "supporting/status.ts",
  "supporting/compose-supporting.ts",
  "supporting/assistance-context/index.ts",
  "supporting/assistance-context/identity.ts",
  "supporting/capability-catalog/index.ts",
  "supporting/capability-catalog/identity.ts",
  "supporting/assumption-confidence/index.ts",
  "supporting/assumption-confidence/identity.ts",
  "supporting/registration/index.ts",
  "supporting/registration/registry.ts",
] as const;

/** Required AI-I6 governance dirs. */
export const AI_GOVERNANCE_REQUIRED_DIRS = [
  "governance",
  "governance/capability-governance",
  "governance/non-authoritative-guard",
  "governance/optionality-preservation",
  "governance/registration",
] as const;

/** Required AI-I6 governance files. */
export const AI_GOVERNANCE_REQUIRED_FILES = [
  "governance/index.ts",
  "governance/status.ts",
  "governance/compose-governance.ts",
  "governance/capability-governance/index.ts",
  "governance/capability-governance/identity.ts",
  "governance/non-authoritative-guard/index.ts",
  "governance/non-authoritative-guard/identity.ts",
  "governance/optionality-preservation/index.ts",
  "governance/optionality-preservation/identity.ts",
  "governance/registration/index.ts",
  "governance/registration/registry.ts",
] as const;

/** Required AI-I7 integration dirs. */
export const AI_INTEGRATION_REQUIRED_DIRS = [
  "integration",
  "integration/data-integration",
  "integration/engine-integration",
  "integration/ux-integration",
  "integration/coordination",
  "integration/exposure",
  "integration/registration",
] as const;

/** Required AI-I7 integration files. */
export const AI_INTEGRATION_REQUIRED_FILES = [
  "integration/index.ts",
  "integration/status.ts",
  "integration/compose-integration.ts",
  "integration/data-integration/index.ts",
  "integration/data-integration/pathway.ts",
  "integration/engine-integration/index.ts",
  "integration/engine-integration/pathway.ts",
  "integration/ux-integration/index.ts",
  "integration/ux-integration/pathway.ts",
  "integration/coordination/index.ts",
  "integration/coordination/pathway.ts",
  "integration/exposure/index.ts",
  "integration/exposure/pathway.ts",
  "integration/registration/index.ts",
  "integration/registration/registry.ts",
] as const;

/** Required AI-I8 extension dirs. */
export const AI_EXTENSION_REQUIRED_DIRS = [
  "extension",
  "extension/specialized-assistants",
  "extension/discipline-specific",
  "extension/predictive-assistance",
  "extension/registration",
] as const;

/** Required AI-I8 extension files. */
export const AI_EXTENSION_REQUIRED_FILES = [
  "extension/index.ts",
  "extension/status.ts",
  "extension/compose-extension.ts",
  "extension/specialized-assistants/index.ts",
  "extension/specialized-assistants/identity.ts",
  "extension/discipline-specific/index.ts",
  "extension/discipline-specific/identity.ts",
  "extension/predictive-assistance/index.ts",
  "extension/predictive-assistance/identity.ts",
  "extension/registration/index.ts",
  "extension/registration/registry.ts",
] as const;

/** Required infrastructure layout dirs (AI-I1). */
export const AI_INFRASTRUCTURE_REQUIRED_DIRS = [
  "infrastructure",
  "infrastructure/registration",
  "infrastructure/wiring",
  "internal",
] as const;

/** Required infrastructure files (AI-I1). */
export const AI_INFRASTRUCTURE_REQUIRED_FILES = [
  "infrastructure/index.ts",
  "infrastructure/status.ts",
  "infrastructure/exposure-boundary.ts",
  "infrastructure/coordination-boundary.ts",
  "infrastructure/contract-classification.ts",
  "infrastructure/namespaces.ts",
  "infrastructure/registration/index.ts",
  "infrastructure/registration/domain-registry.ts",
  "infrastructure/wiring/index.ts",
  "infrastructure/wiring/compose-infrastructure.ts",
  "internal/boundary-policy.ts",
  "internal/extension-points.ts",
] as const;

export function isAllowedAiPublicImport(spec: string): boolean {
  if (spec === "@/ai") return true;
  // Subpaths of @/ai are not public for consumers in AI-I0/I1.
  if (spec.startsWith("@/ai/")) return false;
  return false;
}

export function isForbiddenAiConsumerImport(spec: string): boolean {
  return AI_FORBIDDEN_CONSUMER_IMPORT_PREFIXES.some(
    (p) => spec === p || spec.startsWith(p + "/"),
  );
}

export function isForbiddenAiForeignInternalImport(spec: string): boolean {
  return AI_FORBIDDEN_FOREIGN_INTERNAL_PREFIXES.some(
    (p) => spec === p || spec.startsWith(p + "/"),
  );
}
