/**
 * DATA Domain — Frozen Contract Categories (DATA-P4 / DATA-P9).
 *
 * Every public contract belongs to exactly one category.
 * Do not mix categories; do not add categories without a New API Freeze.
 *
 * @packageDocumentation
 */

/** Frozen Contract Categories (DATA-P9). */
export const DataContractCategory = {
  Lifecycle: "Lifecycle",
  Discovery: "Discovery",
  Transformation: "Transformation",
  Validation: "Validation",
  Metadata: "Metadata",
  Publication: "Publication",
} as const;

export type DataContractCategory =
  (typeof DataContractCategory)[keyof typeof DataContractCategory];

/** Ordered catalog — exactly the six frozen categories; no additions. */
export const DATA_CONTRACT_CATEGORIES = [
  DataContractCategory.Lifecycle,
  DataContractCategory.Discovery,
  DataContractCategory.Transformation,
  DataContractCategory.Validation,
  DataContractCategory.Metadata,
  DataContractCategory.Publication,
] as const satisfies readonly DataContractCategory[];
