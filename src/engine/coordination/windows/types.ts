/**
 * ENGINE Domain — Windows coordination types.
 * OWNERSHIP: ENGINE coordination DTOs — Windows (Platform) owns window infra.
 */

export type WindowsDocumentNotifyInput = {
  readonly documentId: string;
  readonly title?: string;
  readonly kind?: string;
  readonly workspaceId?: string | null;
};

export type WindowsNotifyResult = {
  readonly notified: boolean;
};
