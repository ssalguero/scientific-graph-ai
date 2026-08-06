/**
 * DATA Domain — Metadata model (DATA-P2 / DATA-I4).
 *
 * Descriptive context accompanying authoritative identities.
 * Opaque scientific labels only — no scientific algorithms.
 *
 * @packageDocumentation
 */

/** Structural lifecycle of a metadata record (not the P5 entity lifecycle). */
export const MetadataRecordState = {
  Draft: "Draft",
  Attached: "Attached",
  StructurallyValid: "StructurallyValid",
  Retired: "Retired",
} as const;

export type MetadataRecordState =
  (typeof MetadataRecordState)[keyof typeof MetadataRecordState];

/** Provenance — origin / authorship / acquisition (DATA-P2 Metadata Manager). */
export interface ProvenanceRecord {
  readonly authorship?: string;
  readonly acquisition?: string;
  readonly acquiredAt?: string;
  readonly sourceLabel?: string;
}

export type LineageRelationship =
  | "derived-from"
  | "described-by"
  | "associated-with";

/** One lineage edge — parent identity is preserved, never replaced. */
export interface LineageLink {
  readonly parentIdentityId: string;
  readonly relationship: LineageRelationship;
}

/**
 * Lineage / processing history.
 * `processingHistory` holds opaque step labels — not transformation algorithms.
 */
export interface LineageRecord {
  readonly links: readonly LineageLink[];
  readonly processingHistory: readonly string[];
}

/** Quality indicators — opaque descriptors, not scientific scoring engines. */
export interface QualityDescriptors {
  readonly indicators: readonly string[];
  readonly notes?: string;
}

/** Scientific context — units/definitions as descriptive fields only. */
export interface ScientificContext {
  readonly units?: string;
  readonly definitions?: string;
  readonly notes?: string;
  readonly extras?: Readonly<Record<string, unknown>>;
}

/** Full metadata payload bound to one Supporting association. */
export interface MetadataRecord {
  readonly associationId: string;
  readonly authoritativeIdentityId: string;
  state: MetadataRecordState;
  provenance: ProvenanceRecord;
  lineage: LineageRecord;
  quality: QualityDescriptors;
  context: ScientificContext;
}

export function emptyProvenance(): ProvenanceRecord {
  return {};
}

export function emptyLineage(): LineageRecord {
  return { links: Object.freeze([]), processingHistory: Object.freeze([]) };
}

export function emptyQuality(): QualityDescriptors {
  return { indicators: Object.freeze([]) };
}

export function emptyContext(): ScientificContext {
  return {};
}
