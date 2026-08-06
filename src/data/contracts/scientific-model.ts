/**
 * DATA Domain — Scientific Model Capability Group contracts (DATA-P4 / DATA-P9).
 *
 * Access to scientific entity meaning independent of visualization.
 * Operation-family binding only — no model schemas or manager exposure.
 * DATA-I1: type surface only — no scientific model logic.
 *
 * @packageDocumentation
 */

import type { DataRequest, DataResult } from "./results";

/**
 * Scientific Model Capability Group — public API (type-level).
 *
 * Category mapping:
 * - createScientificModel / updateScientificModel / removeScientificModel → Lifecycle
 * - readScientificModel → Discovery
 * - validateScientificModel → Validation
 */
export interface ScientificModelApi {
  createScientificModel(request?: DataRequest): Promise<DataResult>;
  readScientificModel(request?: DataRequest): Promise<DataResult>;
  updateScientificModel(request?: DataRequest): Promise<DataResult>;
  removeScientificModel(request?: DataRequest): Promise<DataResult>;
  validateScientificModel(request?: DataRequest): Promise<DataResult>;
}
