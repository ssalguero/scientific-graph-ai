/**
 * ENGINE Domain — Workspace coordination ports (injectable; no React).
 * OWNERSHIP: ENGINE defines ports; Platform workspace adapters may fulfill later.
 */

import type {
  ActivateWorkspaceInput,
  ActivateWorkspacePortResult,
  WorkspacePrepareInput,
} from "./types";

/**
 * Workspace activation / prepare port.
 * Does not own workspace React components or layout-engine.
 */
export type WorkspacePort = {
  prepare?(
    input: WorkspacePrepareInput,
  ): void | Promise<void>;
  activate(
    input: ActivateWorkspaceInput,
  ): ActivateWorkspacePortResult | Promise<ActivateWorkspacePortResult>;
  clear?(reason?: string): void | Promise<void>;
};
