import type { LocalProjectRepository } from "../../domain/local-project";
import { InMemoryLocalProjectRepository } from "../../application/local-project/in-memory-repository";
import { IndexedDbLocalProjectRepository } from "./indexed-db-local-project-repository";

export const isIndexedDbAvailable = (): boolean =>
  typeof indexedDB !== "undefined";

export const createLocalProjectRepository = (options?: {
  forceInMemory?: boolean;
  idbFactory?: IDBFactory;
}): LocalProjectRepository => {
  if (options?.forceInMemory || !isIndexedDbAvailable()) {
    return new InMemoryLocalProjectRepository();
  }
  return new IndexedDbLocalProjectRepository(options?.idbFactory);
};

export { IndexedDbLocalProjectRepository } from "./indexed-db-local-project-repository";
export { InMemoryLocalProjectRepository } from "../../application/local-project/in-memory-repository";
export {
  LOCAL_IDB_NAME,
  LOCAL_IDB_VERSION,
  DEFAULT_LOCAL_PROFILE_ID,
} from "./constants";
