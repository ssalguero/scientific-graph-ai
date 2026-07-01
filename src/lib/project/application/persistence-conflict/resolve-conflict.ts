import type { PersistenceConflictResolution } from "../../domain/persistence-conflict";

/** Pure mapping from user resolution to whether hydrate should proceed. */
export const shouldHydrateAfterConflictResolution = (
  resolution: PersistenceConflictResolution
): boolean =>
  resolution === "LOAD_INCOMING" || resolution === "DISCARD_AND_LOAD";
