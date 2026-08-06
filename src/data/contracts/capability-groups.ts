/**
 * DATA Domain — Frozen Capability Groups (DATA-P4 / DATA-P9).
 *
 * Technical binding only. Labels match the certified catalog exactly.
 * Do not add groups without a New API Freeze.
 *
 * @packageDocumentation
 */

/** Frozen public Capability Groups (DATA-P9). */
export const DataCapabilityGroup = {
  Dataset: "Dataset",
  ScientificModel: "ScientificModel",
  Transformation: "Transformation",
  Validation: "Validation",
  Metadata: "Metadata",
  Repository: "Repository",
} as const;

export type DataCapabilityGroup =
  (typeof DataCapabilityGroup)[keyof typeof DataCapabilityGroup];

/** Ordered catalog — exactly the six frozen groups; no additions. */
export const DATA_CAPABILITY_GROUPS = [
  DataCapabilityGroup.Dataset,
  DataCapabilityGroup.ScientificModel,
  DataCapabilityGroup.Transformation,
  DataCapabilityGroup.Validation,
  DataCapabilityGroup.Metadata,
  DataCapabilityGroup.Repository,
] as const satisfies readonly DataCapabilityGroup[];
