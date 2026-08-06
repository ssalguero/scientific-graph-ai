/**
 * ENGINE Domain — Workspace coordination adapter barrel.
 * OWNERSHIP: ENGINE coordinates workspace activation; Platform owns workspace infrastructure.
 * Default ports are no-ops / injectable fakes — no React workspace imports.
 */

export type { WorkspacePort } from "./ports";
export type {
  ActivateWorkspaceInput,
  ActivateWorkspacePortResult,
  WorkspacePrepareInput,
} from "./types";
export { createNoOpWorkspacePort } from "./noop-ports";
export {
  createInjectableWorkspacePort,
  type InjectableWorkspaceHooks,
} from "./injectable-ports";

export const WORKSPACE_COORDINATION_OWNERSHIP =
  "ENGINE coordinates workspace activation; Platform owns workspace infrastructure.";
