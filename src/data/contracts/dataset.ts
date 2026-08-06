/**
 * DATA Domain — Dataset Capability Group contracts (DATA-P4 / DATA-P9).
 *
 * Technical binding of Dataset public responsibility.
 * Representative identifiers from MASTER ROADMAP §16 / plan SoT names.
 * DATA-I1: type surface only — no dataset logic.
 *
 * @packageDocumentation
 */

import type { DataRequest, DataResult } from "./results";

/**
 * Dataset Capability Group — public API (type-level).
 *
 * Category mapping (exactly one category per entry):
 * - createDataset / updateDataset / removeDataset → Lifecycle
 * - loadDataset → Discovery
 * - validateDataset → Validation
 */
export interface DatasetApi {
  createDataset(request?: DataRequest): Promise<DataResult>;
  loadDataset(request?: DataRequest): Promise<DataResult>;
  updateDataset(request?: DataRequest): Promise<DataResult>;
  validateDataset(request?: DataRequest): Promise<DataResult>;
  removeDataset(request?: DataRequest): Promise<DataResult>;
}
