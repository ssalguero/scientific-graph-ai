/**
 * Repository Services — package entry (DATA-I6).
 *
 * @packageDocumentation
 */

export {
  RepositoryServices,
  type RepositoryServicesDeps,
} from "./RepositoryServices";
export type {
  PublicationRecord,
  RepositoryQuery,
  DiscoveryHit,
  PublicationReport,
  DiscoveryReport,
  RetrieveResult,
  PublishResult,
  DiscoverResult,
} from "./model";
export {
  REPOSITORY_INVARIANTS,
  RepositoryInvariantError,
  type RepositoryInvariant,
} from "./invariants";
export {
  evaluatePublicationEligibility,
  assertPublicationEligibility,
  isStillAvailableForDiscovery,
  type EligibilityResult,
} from "./eligibility";
export {
  RepositoryDiagnostics,
  type RepositoryDiagnosticRecord,
} from "./diagnostics";
