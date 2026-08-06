/**
 * ENGINE Domain — DATA coordination adapter (DATA-I7 retarget).
 *
 * OWNERSHIP: ENGINE coordinates calls into DATA; does NOT own scientific computation.
 * Consumes ONLY `@/data` / `@/data/contracts` — never DATA internals.
 *
 * Temporary feedstock adapters (import science / project persistence) remain
 * transitional where Platform or feedstock still owns the mechanism; scientific
 * identity/registry/lifecycle/publication authority is DATA via this adapter.
 */

import {
  configureData,
  getDataApi,
  type DataPublicApi,
  type DataResult,
} from "@/data";

export const DATA_COORDINATION_OWNERSHIP =
  "ENGINE coordinates DATA via @/data public surface; DATA owns scientific services and knowledge.";

/** Ensure DATA public composition is ready for ENGINE consumption. */
export function ensureDataConfigured(): DataPublicApi {
  return configureData();
}

/** Access the certified DATA public API (ENGINE-only coordination helper). */
export function dataApi(): DataPublicApi {
  return getDataApi();
}

/**
 * Register an imported dataset identity under DATA authority after feedstock
 * import science succeeds. Does not perform import parsing.
 */
export async function registerDatasetWithData(options: {
  readonly id?: string;
  readonly origin?: string;
}): Promise<DataResult> {
  ensureDataConfigured();
  return dataApi().dataset.createDataset({
    payload: {
      id: options.id,
      origin: options.origin ?? "engine-import",
    },
  });
}

/**
 * Publish a DATA dataset identity through Repository Capability Group.
 */
export async function publishDatasetWithData(
  identityId: string,
): Promise<DataResult> {
  ensureDataConfigured();
  // validate then publish path through public surface
  const validated = await dataApi().dataset.validateDataset({
    payload: { id: identityId, passed: true },
  });
  if (!validated.ok) return validated;
  return dataApi().repository.publishAsset({
    payload: { id: identityId },
  });
}

export type { DataPublicApi, DataResult };
