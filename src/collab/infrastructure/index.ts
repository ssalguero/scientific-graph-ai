/**
 * COLLAB-I1 — Infrastructure barrel (package-internal).
 *
 * Public contract surface skeleton per P4 / P3.
 * Consumers outside COLLAB must not import this module — use `@/collab` status markers only.
 * No concrete schemas. No sharing / permissions / presence runtime.
 */

export {
  COLLAB_INFRASTRUCTURE_PHASE,
  COLLAB_INFRASTRUCTURE_STATUS,
} from "./status";
export type { CollabInfrastructureStatus } from "./status";

export {
  COLLAB_CONTRACT_PRINCIPLES,
  COLLAB_CONTRACT_PRINCIPLE_MEANING,
} from "./contract-principles";
export type { CollabContractPrinciple } from "./contract-principles";

export {
  COLLAB_PEER_SEAM_IDS,
  COLLAB_PEER_SEAM_MARKERS,
} from "./peer-seams";
export type { CollabPeerSeamId, CollabPeerSeamMarker } from "./peer-seams";

export {
  COLLAB_INVENTORY_COMPONENT_IDS,
  COLLAB_INVENTORY_COMPONENT_REFS,
} from "./inventory-refs";
export type {
  CollabInventoryComponentId,
  CollabInventoryComponentRef,
} from "./inventory-refs";

export {
  COLLAB_CAPABILITY_OWNERS,
  COLLAB_CONTRACT_OWNERSHIP,
} from "./ownership";
export type { CollabCapabilityOwnerKey } from "./ownership";
