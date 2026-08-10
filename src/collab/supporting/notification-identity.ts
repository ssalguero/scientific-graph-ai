/**
 * COLLAB-I6 — Notification Coordination identity (P3 C9).
 */

export const COLLAB_NOTIFICATION_COMPONENT_ID = "C9" as const;

export const COLLAB_NOTIFICATION_COMPONENT_NAME =
  "Notification Coordination" as const;

export const COLLAB_NOTIFICATION_PURPOSE =
  "Emit collaborative-event notices to participants (metadata only)" as const;

export const COLLAB_NOTIFICATION_IDENTITY = {
  id: COLLAB_NOTIFICATION_COMPONENT_ID,
  name: COLLAB_NOTIFICATION_COMPONENT_NAME,
  purpose: COLLAB_NOTIFICATION_PURPOSE,
  phase: "COLLAB-I6" as const,
  ownsScientificTruth: false as const,
  mutatesPeerEntities: false as const,
  metadataOnly: true as const,
  externalDeliveryBackend: false as const,
} as const;

export type CollabNotificationIdentity = typeof COLLAB_NOTIFICATION_IDENTITY;
