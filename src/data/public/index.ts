/**
 * DATA Domain — Public surface (`@/data/public`).
 *
 * DATA-I1: Type-level DataPublicApi aggregate.
 * DATA-I7: Runtime binding via Integration Layer (configureData / getDataApi).
 *
 * @packageDocumentation
 */

export type { DataPublicApi } from "./types";
export type { DatasetApi } from "../contracts/dataset";
export type { ScientificModelApi } from "../contracts/scientific-model";
export type { TransformationApi } from "../contracts/transformation";
export type { ValidationApi } from "../contracts/validation";
export type { MetadataApi } from "../contracts/metadata";
export type { RepositoryApi } from "../contracts/repository";

import { getIntegrationLayer } from "../integration/IntegrationLayer";
import type { DataPublicApi } from "./types";

/**
 * Configure the default DATA composition used by public facades.
 * Call at app/ENGINE bootstrap before DATA consumption.
 */
export function configureData(): DataPublicApi {
  return getIntegrationLayer().configure();
}

/** Return the configured public API (configures on first use). */
export function getDataApi(): DataPublicApi {
  return getIntegrationLayer().getApi();
}
