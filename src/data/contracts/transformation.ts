/**
 * DATA Domain — Transformation Capability Group contracts (DATA-P4 / DATA-P9).
 *
 * Deterministic scientific transformation intents.
 * Representative identifiers from MASTER ROADMAP §16 / plan SoT names.
 * DATA-I1: type surface only — no transformation logic.
 *
 * @packageDocumentation
 */

import type { DataRequest, DataResult } from "./results";

/**
 * Transformation Capability Group — public API (type-level).
 *
 * All entries → Contract Category Transformation · Operation Family Transform.
 */
export interface TransformationApi {
  normalize(request?: DataRequest): Promise<DataResult>;
  filter(request?: DataRequest): Promise<DataResult>;
  aggregate(request?: DataRequest): Promise<DataResult>;
  interpolate(request?: DataRequest): Promise<DataResult>;
  transform(request?: DataRequest): Promise<DataResult>;
}
