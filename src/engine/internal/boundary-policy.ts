/**
 * ENGINE-8/9 — Boundary enforcement policy (ENGINE-internal).
 *
 * OWNERSHIP: Single source of allowlists / certified-flow inventory used by
 * `scripts/validate-engine-boundaries.ts` and boundary unit tests.
 *
 * Not part of the consumer Application API — do not import from UX / app.
 */

/** Frozen public Workflow API names (certified Product Flows). */
export const CERTIFIED_PUBLIC_WORKFLOW_IDS = [
  "createProject",
  "openProject",
  "closeProject",
  "saveProject",
  "importDataset",
  "exportProject",
] as const;

/** Frozen public Lifecycle API names (certified lifecycle Product Flows). */
export const CERTIFIED_PUBLIC_LIFECYCLE_IDS = [
  "initializeApplication",
  "activateWorkspace",
  "activateDocument",
  "shutdownApplication",
] as const;

/**
 * Internal workflow ids registered on WorkflowEngine but not (yet) on public
 * WorkflowApi facades.
 */
export const CERTIFIED_INTERNAL_WORKFLOW_IDS = [
  "restoreSession",
  "sessionAutosaveFlush",
  "exportResults", // alias of exportProject
  ...CERTIFIED_PUBLIC_LIFECYCLE_IDS,
] as const;

/**
 * Business command ids for certified Product Flows (Command Orchestrator).
 */
export const CERTIFIED_BUSINESS_COMMAND_IDS = [
  "project.create",
  "project.open",
  "project.save",
  "project.close",
  "session.restore",
  "session.autosave.flush",
  "dataset.import",
  "project.export",
  "app.initialize",
  "workspace.activate",
  "document.activate",
  "app.shutdown",
] as const;

/**
 * App / UX files still allowed to call superseded certified-flow use-cases.
 * ENGINE-9 cut over GraphEditor dual-path — allowlist is empty.
 * Keep the array for validator/policy shape; do not re-add cut-over files.
 *
 * Paths are repo-relative POSIX.
 */
export const LEGACY_ORCHESTRATION_ALLOWLIST = [] as const;

/**
 * Symbols that represent certified Product Flow orchestration.
 *
 * Outside the allowlist (and outside `src/engine/**` / `src/lib/**` / tests),
 * importing these as value bindings is a boundary violation.
 */
export const FORBIDDEN_LEGACY_ORCHESTRATION_SYMBOLS = [
  "saveLocalProject",
  "openLocalProject",
  "exportLocalProjectToSgproj",
  "attemptExperimentalImport",
] as const;

/** Consumer-allowed ENGINE import prefixes (public surface only). */
export const ENGINE_PUBLIC_IMPORT_PREFIXES = [
  "@/engine",
  "@/engine/contracts",
] as const;

export type CertifiedPublicWorkflowId =
  (typeof CERTIFIED_PUBLIC_WORKFLOW_IDS)[number];
export type CertifiedPublicLifecycleId =
  (typeof CERTIFIED_PUBLIC_LIFECYCLE_IDS)[number];
