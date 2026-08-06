/**
 * ENGINE Domain — Document Engine (business orchestration).
 * OWNERSHIP: ENGINE owns document register/activate/deactivate business rules.
 * In-memory registry only — does not own WindowRegistry, persistence, or React state.
 */

import { DOCUMENT_ERROR_CODES, DocumentFlowError } from "./errors";
import type { DocumentNotificationPort } from "./ports";
import type {
  ActivateDocumentInput,
  ActivateDocumentResult,
  DeactivateDocumentInput,
  DeactivateDocumentResult,
  DocumentRecord,
  RegisterDocumentInput,
  RegisterDocumentResult,
} from "./types";

export type DocumentEngineOptions = {
  readonly notifications?: DocumentNotificationPort;
};

function createNoOpNotifications(): DocumentNotificationPort {
  return {
    onDocumentActivated() {
      // no-op
    },
    onDocumentDeactivated() {
      // no-op
    },
  };
}

/**
 * Document Engine — ENGINE-owned in-memory document registry + activation.
 */
export class DocumentEngine {
  private readonly documents = new Map<string, DocumentRecord>();
  private activeDocumentId: string | null = null;
  private readonly notifications: DocumentNotificationPort;

  constructor(options: DocumentEngineOptions = {}) {
    this.notifications =
      options.notifications ?? createNoOpNotifications();
  }

  /** Currently active document id (ENGINE view — not WindowManager selection). */
  getActiveDocumentId(): string | null {
    return this.activeDocumentId;
  }

  getDocument(id: string): DocumentRecord | undefined {
    return this.documents.get(id);
  }

  listDocuments(): readonly DocumentRecord[] {
    return [...this.documents.values()];
  }

  /** Clear registry and active selection (used on application shutdown). */
  clear(): void {
    this.documents.clear();
    this.activeDocumentId = null;
  }

  async register(input: RegisterDocumentInput): Promise<RegisterDocumentResult> {
    if (!input.id || typeof input.id !== "string" || !input.id.trim()) {
      throw new DocumentFlowError(
        DOCUMENT_ERROR_CODES.INVALID_PAYLOAD,
        "registerDocument requires a non-empty document id",
      );
    }
    const id = input.id.trim();
    const existing = this.documents.get(id);
    if (existing) {
      return { document: existing, created: false };
    }

    const document: DocumentRecord = {
      id,
      title: input.title?.trim() || id,
      kind: input.kind?.trim() || "document",
      workspaceId: input.workspaceId ?? null,
      registeredAt: new Date().toISOString(),
      meta: input.meta,
    };
    this.documents.set(id, document);
    return { document, created: true };
  }

  async activate(
    input: ActivateDocumentInput,
  ): Promise<ActivateDocumentResult> {
    if (!input.id || typeof input.id !== "string" || !input.id.trim()) {
      throw new DocumentFlowError(
        DOCUMENT_ERROR_CODES.INVALID_PAYLOAD,
        "activateDocument requires a non-empty document id",
      );
    }
    const id = input.id.trim();
    let document = this.documents.get(id);

    if (!document) {
      if (!input.registerIfMissing) {
        throw new DocumentFlowError(
          DOCUMENT_ERROR_CODES.NOT_FOUND,
          `Document "${id}" is not registered`,
        );
      }
      const registered = await this.register({
        id,
        title: input.title,
        kind: input.kind,
        workspaceId: input.workspaceId,
        meta: input.meta,
      });
      document = registered.document;
    }

    const previousActiveId = this.activeDocumentId;
    this.activeDocumentId = id;

    try {
      await this.notifications.onDocumentActivated(document);
    } catch (err) {
      this.activeDocumentId = previousActiveId;
      const message =
        err instanceof Error ? err.message : "Document activate notification failed";
      throw new DocumentFlowError(
        DOCUMENT_ERROR_CODES.ACTIVATE_FAILED,
        message,
      );
    }

    return { document, previousActiveId };
  }

  async deactivate(
    input: DeactivateDocumentInput = {},
  ): Promise<DeactivateDocumentResult> {
    const targetId = input.id?.trim() || this.activeDocumentId;
    if (!targetId) {
      return { deactivatedId: null };
    }
    if (
      input.id &&
      this.activeDocumentId &&
      input.id.trim() !== this.activeDocumentId
    ) {
      throw new DocumentFlowError(
        DOCUMENT_ERROR_CODES.NO_ACTIVE,
        `deactivateDocument id "${input.id}" does not match active document "${this.activeDocumentId}"`,
      );
    }
    if (this.activeDocumentId !== targetId) {
      return { deactivatedId: null };
    }

    this.activeDocumentId = null;
    await this.notifications.onDocumentDeactivated(targetId);
    return { deactivatedId: targetId };
  }
}

export function createDocumentEngine(
  options?: DocumentEngineOptions,
): DocumentEngine {
  return new DocumentEngine(options);
}
