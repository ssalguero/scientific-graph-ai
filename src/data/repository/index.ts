/**
 * Repository Layer (DATA-P2).
 *
 * DATA-I2: Dataset Manager Authoritative Registry.
 * DATA-I6: Repository Services — Publication / Discovery access mediation.
 *
 * @packageDocumentation
 */

export { DatasetManager } from "./dataset-manager";
export {
  RepositoryServices,
  REPOSITORY_INVARIANTS,
  RepositoryInvariantError,
  evaluatePublicationEligibility,
  type RepositoryServicesDeps,
  type PublicationRecord,
  type RepositoryQuery,
  type DiscoveryHit,
  type PublishResult,
  type DiscoverResult,
  type RetrieveResult,
} from "./repository-services";
