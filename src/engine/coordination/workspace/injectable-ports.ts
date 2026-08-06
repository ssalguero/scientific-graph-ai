/**
 * ENGINE Domain — Injectable Workspace port wrappers (fakes / future Platform adapters).
 */

import type { WorkspacePort } from "./ports";
import type {
  ActivateWorkspaceInput,
  ActivateWorkspacePortResult,
  WorkspacePrepareInput,
} from "./types";

export type InjectableWorkspaceHooks = {
  prepare?(input: WorkspacePrepareInput): void | Promise<void>;
  activate?(
    input: ActivateWorkspaceInput,
  ):
    | ActivateWorkspacePortResult
    | Promise<ActivateWorkspacePortResult>
    | void;
  clear?(reason?: string): void | Promise<void>;
};

export function createInjectableWorkspacePort(
  hooks: InjectableWorkspaceHooks | null | undefined,
): WorkspacePort {
  return {
    async prepare(input): Promise<void> {
      await hooks?.prepare?.(input);
    },
    async activate(input): Promise<ActivateWorkspacePortResult> {
      if (!hooks?.activate) {
        return { workspaceId: input.workspaceId, activated: false };
      }
      const result = await hooks.activate(input);
      if (result && typeof result === "object" && "workspaceId" in result) {
        return result;
      }
      return { workspaceId: input.workspaceId, activated: true };
    },
    async clear(reason): Promise<void> {
      await hooks?.clear?.(reason);
    },
  };
}
