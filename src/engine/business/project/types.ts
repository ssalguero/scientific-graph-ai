/**
 * ENGINE Domain — Project Engine DTOs (business layer).
 * OWNERSHIP: ENGINE owns project lifecycle request/result shapes for Product Flows.
 * Collect-context payloads are opaque editor snapshots (temporary until DATA contracts).
 */

/** Opaque editor collect snapshot — same shape as EditorProjectCollectContextV2. */
export type ProjectCollectContext = Record<string, unknown> & {
  readonly metadata: {
    readonly id: string;
    readonly name: string;
    readonly createdAt: string;
    readonly updatedAt: string;
  };
};

export type CreateProjectInput = {
  /** Display name; defaults to untitled when omitted / blank. */
  readonly name?: string;
  /** Optional pre-built collect context; when omitted, adapter builds an empty project. */
  readonly ctx?: ProjectCollectContext;
  readonly appVersion?: string;
};

export type CreateProjectResult = {
  readonly id: string;
  readonly name: string;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type OpenProjectInput = {
  readonly id: string;
  readonly touchAccess?: boolean;
};

export type OpenProjectResult = {
  readonly id: string;
  readonly name: string;
  readonly integrityStatus: "VALID" | "CHECKSUM_FAILED" | "NOT_VERIFIED";
  /** Opaque hydrate patch for UX to apply (ENGINE does not touch React state). */
  readonly patch: unknown;
  readonly summary: unknown;
};

export type SaveProjectInput = {
  readonly projectName: string;
  /** Required editor collect snapshot for durable save. */
  readonly ctx: ProjectCollectContext;
  readonly appVersion?: string;
};

export type SaveProjectResult = {
  readonly id: string;
  readonly name: string;
  readonly updatedAt: string;
  readonly summary: unknown;
};

export type CloseProjectInput = {
  /** When omitted, closes the Project Engine active project (if any). */
  readonly id?: string;
  /** Reserved for ENGINE-5+ dirty/discard policy — ignored in ENGINE-4. */
  readonly discardUnsaved?: boolean;
};

export type CloseProjectResult = {
  /** Id that was closed, or null when nothing was active. */
  readonly closedId: string | null;
};
