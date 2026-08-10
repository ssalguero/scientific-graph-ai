/**
 * COLLAB Domain — Public barrel.
 *
 * Consumers may import ONLY from `@/collab`.
 *
 * COLLAB-I0 — Foundation identity only.
 * No sharing · membership · permissions · annotations · presence · realtime.
 *
 * @packageDocumentation
 */

export {
  COLLAB_DOMAIN_ID,
  COLLAB_DOMAIN_NAME,
  COLLAB_DOMAIN_ARCHITECTURAL_ROLE,
  COLLAB_DOMAIN_MOTTO,
  COLLAB_OWNERSHIP_PRINCIPLE,
  COLLAB_FOUNDATION_PHASE,
  COLLAB_FOUNDATION_STATUS,
} from "./foundation";

export type {
  CollabFoundationIdentity,
  CollabFoundationStatus,
} from "./foundation";
