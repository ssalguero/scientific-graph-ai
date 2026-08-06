/**
 * DATA Domain — Validation Capability Group contracts (DATA-P4 / DATA-P9).
 *
 * Request scientific integrity evaluation and gate outcomes.
 * DATA-I1: type surface only — no validation rules or engine logic.
 *
 * @packageDocumentation
 */

import type { DataRequest, DataResult } from "./results";

/**
 * Validation Capability Group — public API (type-level).
 *
 * Category: Validation · Operation Family: Validate.
 * (Dataset/Model-scoped validate* entries live on their Capability Groups.)
 */
export interface ValidationApi {
  validate(request?: DataRequest): Promise<DataResult>;
}
