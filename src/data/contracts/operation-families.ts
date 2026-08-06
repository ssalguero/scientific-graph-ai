/**
 * DATA Domain — Frozen conceptual Operation Families (DATA-P4 / DATA-P9).
 *
 * Technical identifiers bind 1:1 to the certified conceptual families.
 * Do not invent new operation families without a New API Freeze.
 *
 * @packageDocumentation
 */

/** Frozen conceptual operation families (DATA-P9). */
export const DataOperationFamily = {
  Create: "Create",
  Read: "Read",
  Update: "Update",
  Remove: "Remove",
  Validate: "Validate",
  Transform: "Transform",
  QueryDiscover: "QueryDiscover",
  PublishMakeAvailable: "PublishMakeAvailable",
  TrackLineageMetadata: "TrackLineageMetadata",
} as const;

export type DataOperationFamily =
  (typeof DataOperationFamily)[keyof typeof DataOperationFamily];

/** Ordered catalog — exactly the nine frozen families; no additions. */
export const DATA_OPERATION_FAMILIES = [
  DataOperationFamily.Create,
  DataOperationFamily.Read,
  DataOperationFamily.Update,
  DataOperationFamily.Remove,
  DataOperationFamily.Validate,
  DataOperationFamily.Transform,
  DataOperationFamily.QueryDiscover,
  DataOperationFamily.PublishMakeAvailable,
  DataOperationFamily.TrackLineageMetadata,
] as const satisfies readonly DataOperationFamily[];
