/**
 * DATA Domain — Public API aggregate type (DATA-I1 / DATA-I7).
 *
 * Side-effect free — safe for Integration factory imports.
 *
 * @packageDocumentation
 */

import type { DatasetApi } from "../contracts/dataset";
import type { ScientificModelApi } from "../contracts/scientific-model";
import type { TransformationApi } from "../contracts/transformation";
import type { ValidationApi } from "../contracts/validation";
import type { MetadataApi } from "../contracts/metadata";
import type { RepositoryApi } from "../contracts/repository";

/**
 * Aggregate Public Scientific Data API.
 * Exactly the six frozen Capability Groups — no additional namespaces.
 */
export interface DataPublicApi {
  readonly dataset: DatasetApi;
  readonly scientificModel: ScientificModelApi;
  readonly transformation: TransformationApi;
  readonly validation: ValidationApi;
  readonly metadata: MetadataApi;
  readonly repository: RepositoryApi;
}
