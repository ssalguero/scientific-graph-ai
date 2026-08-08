/**
 * PERFORMANCE package-private internals.
 */

export const PERFORMANCE_INTERNAL_PACKAGE = "performance/internal" as const;

export {
  PERFORMANCE_PUBLIC_IMPORT_PREFIXES,
  PERFORMANCE_INTERNAL_FOLDER_SEGMENTS,
  PERFORMANCE_FORBIDDEN_CONSUMER_IMPORT_PREFIXES,
  PERFORMANCE_FORBIDDEN_PEER_IMPORT_PREFIXES,
  PERFORMANCE_I2_ALLOWED_PEER_IMPORTS,
  PERFORMANCE_FORBIDDEN_PEER_DEEP_PREFIXES,
  isAllowedPerformancePublicImport,
  isForbiddenPerformanceConsumerImport,
  isForbiddenPerformancePeerImport,
  isAllowedPerformanceI2PeerImport,
} from "./boundary-policy";
