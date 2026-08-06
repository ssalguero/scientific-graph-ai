/**
 * ENGINE Domain — Workspace coordination types.
 * OWNERSHIP: ENGINE coordination DTOs — Platform owns workspace infrastructure.
 */

export type ActivateWorkspaceInput = {
  readonly workspaceId: string;
  readonly meta?: Readonly<Record<string, unknown>>;
};

export type ActivateWorkspacePortResult = {
  readonly workspaceId: string;
  readonly activated: boolean;
};

export type WorkspacePrepareInput = {
  readonly appId?: string;
  readonly meta?: Readonly<Record<string, unknown>>;
};
