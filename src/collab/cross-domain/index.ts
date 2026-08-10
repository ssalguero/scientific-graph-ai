/**
 * COLLAB-I8 — Cross-Domain Integration barrel (package-internal).
 *
 * Consumers outside COLLAB must not import this module — use `@/collab` status markers.
 * Hardening / Domain Certification remain deferred.
 */

export {
  COLLAB_CROSS_DOMAIN_PHASE,
  COLLAB_CROSS_DOMAIN_STATUS,
} from "./status";
export type { CollabCrossDomainStatus } from "./status";

export {
  COLLAB_COORDINATOR_COMPONENT_ID,
  COLLAB_COORDINATOR_COMPONENT_NAME,
  COLLAB_COORDINATOR_IDENTITY,
  COLLAB_METADATA_COORDINATION_COMPONENT_ID,
  COLLAB_METADATA_COORDINATION_COMPONENT_NAME,
  COLLAB_METADATA_COORDINATION_IDENTITY,
} from "./identities";
export type {
  CollabCoordinatorIdentity,
  CollabMetadataCoordinationIdentity,
} from "./identities";

export {
  COLLAB_I8_INTEGRATION_PEERS,
  COLLAB_I8_PEER_ONLY,
  COLLAB_I8_DEFERRED,
  COLLAB_I8_NON_BYPASS,
  COLLAB_I8_NON_BLOCKING,
} from "./gates";
export type { CollabIntegrationGateReport } from "./gates";

export {
  COLLAB_ENGINE_SEAM_ID,
  COLLAB_ENGINE_PUBLIC_OPERATION_LABELS,
  observeEnginePublicSeam,
} from "./engine-adapter";
export type {
  CollabEnginePublicOperationLabel,
  CollabEngineSeamObservation,
} from "./engine-adapter";

export {
  COLLAB_DATA_SEAM_ID,
  observeDataPublicSeam,
} from "./data-adapter";
export type { CollabDataSeamObservation } from "./data-adapter";

export {
  COLLAB_UX_SEAM_ID,
  observeUxPublicSeam,
  exposeCollaborationStateForUx,
} from "./ux-adapter";
export type {
  CollabUxSeamObservation,
  CollabUxStateExposure,
} from "./ux-adapter";

export {
  COLLAB_AI_PEER_SEAM_ID,
  assertAiPeerOnlyBoundary,
} from "./ai-peer";
export type { CollabAiPeerBoundary } from "./ai-peer";

export { verifyCrossDomainIntegrationGates } from "./verify";
