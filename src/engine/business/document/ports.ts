/**
 * ENGINE Domain — Document notification port (injectable; no React).
 * OWNERSHIP: ENGINE defines the port; Windows / Workspace adapters may fulfill later.
 */

import type { DocumentRecord } from "./types";

/**
 * Optional notifications when ENGINE activates / deactivates documents.
 * Does not own WindowRegistry — notify only.
 */
export type DocumentNotificationPort = {
  onDocumentActivated(document: DocumentRecord): void | Promise<void>;
  onDocumentDeactivated(documentId: string): void | Promise<void>;
};
