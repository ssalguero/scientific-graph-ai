/**
 * ENGINE Domain — No-op Workspace ports (safe defaults for Node tests / unwired app).
 */

import type { WorkspacePort } from "./ports";
import type { ActivateWorkspacePortResult } from "./types";

export function createNoOpWorkspacePort(): WorkspacePort {
  return {
    async prepare(): Promise<void> {
      // no-op
    },
    activate(input): ActivateWorkspacePortResult {
      return { workspaceId: input.workspaceId, activated: false };
    },
    async clear(): Promise<void> {
      // no-op
    },
  };
}
