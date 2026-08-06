/**
 * ENGINE Domain — Document Engine types.
 * OWNERSHIP: ENGINE-owned document registry shapes (in-memory).
 * Does not own WindowRegistry, file persistence, or React editor state.
 */

/** Registered document record in the ENGINE document registry. */
export type DocumentRecord = {
  readonly id: string;
  readonly title: string;
  readonly kind: string;
  readonly workspaceId: string | null;
  readonly registeredAt: string;
  readonly meta?: Readonly<Record<string, unknown>>;
};

/** Input to register a document in the ENGINE registry. */
export type RegisterDocumentInput = {
  readonly id: string;
  readonly title?: string;
  readonly kind?: string;
  readonly workspaceId?: string | null;
  readonly meta?: Readonly<Record<string, unknown>>;
};

/** Input to activate a registered document. */
export type ActivateDocumentInput = {
  readonly id: string;
  /** When true, register a stub document if missing (default false). */
  readonly registerIfMissing?: boolean;
  readonly title?: string;
  readonly kind?: string;
  readonly workspaceId?: string | null;
  readonly meta?: Readonly<Record<string, unknown>>;
};

/** Input to deactivate the active document (or a specific id). */
export type DeactivateDocumentInput = {
  readonly id?: string;
};

export type RegisterDocumentResult = {
  readonly document: DocumentRecord;
  readonly created: boolean;
};

export type ActivateDocumentResult = {
  readonly document: DocumentRecord;
  readonly previousActiveId: string | null;
};

export type DeactivateDocumentResult = {
  readonly deactivatedId: string | null;
};
