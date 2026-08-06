/**
 * Shared IndexedDB local-project repository singleton.
 * Used by GraphEditor persistence hooks and ENGINE bootstrap (ENGINE-9).
 */

import { createLocalProjectRepository } from "@/lib/project/adapters/indexeddb";
import type { LocalProjectRepository } from "@/lib/project/domain/local-project";

let sharedRepo: LocalProjectRepository | null = null;

export const getLocalProjectRepository = (): LocalProjectRepository => {
  if (!sharedRepo) {
    sharedRepo = createLocalProjectRepository();
  }
  return sharedRepo;
};
