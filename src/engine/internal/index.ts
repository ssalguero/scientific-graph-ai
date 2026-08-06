/**
 * ENGINE Domain — Internal private modules.
 * NEVER import from UX, DATA, or outside ENGINE.
 * ENGINE-1: Shared stub helpers only — visibility frozen.
 * ENGINE-3: UX command intention bridge (plain DTOs — no React / `@/ui`).
 * ENGINE-4: Default composition root (Project Product Flows).
 */

export { engineNotImplemented } from "./todo";
export {
  toEngineCommandRequest,
  bridgeUxCommandIntention,
  type UxCommandIntention,
} from "./ux-command-bridge";
export {
  composeEngine,
  getDefaultComposition,
  setDefaultComposition,
  setDefaultCompositionForTests,
  type ComposedEngine,
  type ComposeEngineOptions,
} from "./compose";
export {
  CERTIFIED_BUSINESS_COMMAND_IDS,
  CERTIFIED_INTERNAL_WORKFLOW_IDS,
  CERTIFIED_PUBLIC_LIFECYCLE_IDS,
  CERTIFIED_PUBLIC_WORKFLOW_IDS,
  ENGINE_PUBLIC_IMPORT_PREFIXES,
  FORBIDDEN_LEGACY_ORCHESTRATION_SYMBOLS,
  LEGACY_ORCHESTRATION_ALLOWLIST,
  type CertifiedPublicLifecycleId,
  type CertifiedPublicWorkflowId,
} from "./boundary-policy";
export {
  WORKFLOW_ERROR_CODES,
  COMMAND_ERROR_CODES,
  type WorkflowErrorCode,
  type CommandErrorCode,
} from "./error-codes";

export const INTERNAL_BOUNDARY =
  "src/engine/internal/** is private to ENGINE — external import forbidden.";
