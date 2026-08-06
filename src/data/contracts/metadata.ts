/**
 * DATA Domain — Metadata Capability Group contracts (DATA-P4 / DATA-P9).
 *
 * Descriptive context and lineage association with scientific meaning.
 * Representative identifiers from MASTER ROADMAP §16 / plan SoT names.
 * DATA-I1: type surface only — no metadata behavior.
 *
 * @packageDocumentation
 */

import type { DataRequest, DataResult } from "./results";

/**
 * Metadata Capability Group — public API (type-level).
 *
 * Category mapping:
 * - readMetadata / updateMetadata / validateMetadata / trackLineage → Metadata
 * - trackLineage → Operation Family TrackLineageMetadata
 */
export interface MetadataApi {
  readMetadata(request?: DataRequest): Promise<DataResult>;
  updateMetadata(request?: DataRequest): Promise<DataResult>;
  validateMetadata(request?: DataRequest): Promise<DataResult>;
  trackLineage(request?: DataRequest): Promise<DataResult>;
}
