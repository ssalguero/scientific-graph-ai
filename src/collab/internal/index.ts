/**
 * COLLAB package-private internals.
 */

export const COLLAB_INTERNAL_PACKAGE = "collab/internal" as const;

export {
  COLLAB_PUBLIC_IMPORT_PREFIXES,
  COLLAB_INTERNAL_FOLDER_SEGMENTS,
  COLLAB_FORBIDDEN_CONSUMER_IMPORT_PREFIXES,
  COLLAB_FORBIDDEN_PEER_IMPORT_PREFIXES,
  COLLAB_ARCHITECTURAL_ALLOWED_DEPS,
  isAllowedCollabPublicImport,
  isForbiddenCollabConsumerImport,
  isForbiddenCollabPeerImport,
} from "./boundary-policy";
