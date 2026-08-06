/**
 * DATA Domain — Repository Capability Group contracts (DATA-P4 / DATA-P9).
 *
 * Discover / retrieve / publish through the official semantic access point.
 * DATA-I1: type surface only — no repository logic or storage engines.
 *
 * @packageDocumentation
 */

import type { DataRequest, DataResult } from "./results";

/**
 * Repository Capability Group — public API (type-level).
 *
 * Category mapping:
 * - discoverAssets / retrieveAsset → Discovery
 * - publishAsset → Publication
 */
export interface RepositoryApi {
  discoverAssets(request?: DataRequest): Promise<DataResult>;
  retrieveAsset(request?: DataRequest): Promise<DataResult>;
  publishAsset(request?: DataRequest): Promise<DataResult>;
}
