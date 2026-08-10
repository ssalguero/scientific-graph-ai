/**
 * COLLAB-I6 — In-memory supporting metadata registry.
 *
 * Not Platform persistence. Not a remote collaboration backend. Not realtime.
 */

import type {
  CollabActivityEventMetadata,
  CollabCollaborativeSessionId,
  CollabCollaborativeSessionMetadata,
  CollabNotificationMetadata,
  CollabPeerIdentityRef,
  CollabPresenceId,
  CollabPresenceMetadata,
} from "./types";

export type CollabSupportingRegistrySnapshot = {
  readonly presence: readonly CollabPresenceMetadata[];
  readonly sessions: readonly CollabCollaborativeSessionMetadata[];
  readonly activity: readonly CollabActivityEventMetadata[];
  readonly notifications: readonly CollabNotificationMetadata[];
};

export type CollabSupportingRegistry = {
  upsertPresence(record: CollabPresenceMetadata): void;
  getPresence(id: CollabPresenceId): CollabPresenceMetadata | undefined;
  listPresenceForPeer(
    peerIdentityRef: CollabPeerIdentityRef,
  ): readonly CollabPresenceMetadata[];
  upsertSession(session: CollabCollaborativeSessionMetadata): void;
  getSession(
    id: CollabCollaborativeSessionId,
  ): CollabCollaborativeSessionMetadata | undefined;
  listSessionsForPeer(
    peerIdentityRef: CollabPeerIdentityRef,
  ): readonly CollabCollaborativeSessionMetadata[];
  appendActivity(event: CollabActivityEventMetadata): void;
  listActivityForPeer(
    peerIdentityRef: CollabPeerIdentityRef,
  ): readonly CollabActivityEventMetadata[];
  appendNotification(notification: CollabNotificationMetadata): void;
  listNotificationsForActor(
    recipientActorId: string,
  ): readonly CollabNotificationMetadata[];
  snapshot(): CollabSupportingRegistrySnapshot;
};

export function createSupportingRegistry(): CollabSupportingRegistry {
  const presence = new Map<string, CollabPresenceMetadata>();
  const sessions = new Map<string, CollabCollaborativeSessionMetadata>();
  const activity = new Map<string, CollabActivityEventMetadata>();
  const notifications = new Map<string, CollabNotificationMetadata>();

  return {
    upsertPresence(record) {
      presence.set(record.id, record);
    },
    getPresence(id) {
      return presence.get(id);
    },
    listPresenceForPeer(peerIdentityRef) {
      return [...presence.values()].filter(
        (p) => p.peerIdentityRef === peerIdentityRef,
      );
    },
    upsertSession(session) {
      sessions.set(session.id, session);
    },
    getSession(id) {
      return sessions.get(id);
    },
    listSessionsForPeer(peerIdentityRef) {
      return [...sessions.values()].filter(
        (s) => s.peerIdentityRef === peerIdentityRef,
      );
    },
    appendActivity(event) {
      activity.set(event.id, event);
    },
    listActivityForPeer(peerIdentityRef) {
      return [...activity.values()].filter(
        (e) => e.peerIdentityRef === peerIdentityRef,
      );
    },
    appendNotification(notification) {
      notifications.set(notification.id, notification);
    },
    listNotificationsForActor(recipientActorId) {
      return [...notifications.values()].filter(
        (n) => n.recipientActorId === recipientActorId,
      );
    },
    snapshot() {
      return {
        presence: [...presence.values()],
        sessions: [...sessions.values()],
        activity: [...activity.values()],
        notifications: [...notifications.values()],
      };
    },
  };
}
