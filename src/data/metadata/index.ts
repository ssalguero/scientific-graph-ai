/**
 * Metadata Manager — package entry (DATA-I4 Metadata & Lineage).
 *
 * @packageDocumentation
 */

export { MetadataManager } from "./MetadataManager";
export {
  MetadataRecordState,
  emptyProvenance,
  emptyLineage,
  emptyQuality,
  emptyContext,
  type MetadataRecord,
  type ProvenanceRecord,
  type LineageRecord,
  type LineageLink,
  type LineageRelationship,
  type QualityDescriptors,
  type ScientificContext,
  type MetadataRecordState as MetadataRecordStateId,
} from "./model";
export {
  METADATA_INVARIANTS,
  MetadataInvariantError,
  type MetadataInvariant,
} from "./invariants";
export {
  validateMetadataStructure,
  assertMetadataStructure,
  type StructuralValidationResult,
} from "./structural-validation";
export {
  MetadataDiagnostics,
  type MetadataDiagnosticRecord,
} from "./diagnostics";
