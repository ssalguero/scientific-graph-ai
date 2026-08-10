/**
 * COLLAB-I6 — Supporting metadata operations (P2 · P3 C7–C10 · P5).
 *
 * Async only. No live sync transport, replicated conflict types, operational
 * transform, or cursors. No Archive. No I7+ audit governance.
 */

import {
  asCollabActorId,
  asCollabPeerIdentityRef,
} from "../membership/types";
import type { CollabSupportingRegistry } from "./registry";
import type {
  CollabActivityEventMetadata,
  CollabCollaborativeSessionMetadata,
  CollabNotificationMetadata,
  CollabPresenceMetadata,
} from "./types";

export type SetPresenceInput = {
  readonly actorId: string;
  readonly peerIdentityRef: string;
  readonly status?: CollabPresenceMetadata["status"];
  readonly sessionId?: CollabCollaborativeSessionMetadata["id"];
  readonly now?: string;
};

export type OpenCollaborativeSessionInput = {
  readonly peerIdentityRef: string;
  readonly openedByActorId: string;
  readonly label: string;
  readonly now?: string;
};

export type CloseCollaborativeSessionInput = {
  readonly sessionId: CollabCollaborativeSessionMetadata["id"];
  readonly actorId: string;
  readonly now?: string;
};

export type RecordActivityInput = {
  readonly actorId: string;
  readonly peerIdentityRef: string;
  readonly operation: string;
  readonly sessionId?: CollabCollaborativeSessionMetadata["id"];
  readonly now?: string;
};

export type EmitNotificationInput = {
  readonly recipientActorId: string;
  readonly peerIdentityRef: string;
  readonly eventKind: string;
  readonly body: string;
  readonly now?: string;
};

export type CollabSupportingOperationResult<T> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: string };

let seq = 0;
const nextId = (prefix: string): string => {
  seq += 1;
  return `${prefix}-${seq}`;
};

const stamp = (now?: string): string => now ?? new Date(0).toISOString();

/** Record async Presence awareness (who / where / session) — not live cursors. */
export function setPresence(
  registry: CollabSupportingRegistry,
  input: SetPresenceInput,
): CollabSupportingOperationResult<CollabPresenceMetadata> {
  const actorId = input.actorId.trim();
  const peerIdentityRef = input.peerIdentityRef.trim();
  if (!actorId) return { ok: false, error: "actorId is required" };
  if (!peerIdentityRef) return { ok: false, error: "peerIdentityRef is required" };

  const status = input.status ?? "active";
  if (status !== "active" && status !== "idle" && status !== "away") {
    return { ok: false, error: "status must be active, idle, or away" };
  }

  if (input.sessionId) {
    const session = registry.getSession(input.sessionId);
    if (!session) return { ok: false, error: "session not found" };
    if (session.status === "closed") {
      return { ok: false, error: "cannot attach presence to a closed session" };
    }
  }

  const record: CollabPresenceMetadata = {
    id: nextId("cpr") as CollabPresenceMetadata["id"],
    actorId: asCollabActorId(actorId),
    peerIdentityRef: asCollabPeerIdentityRef(peerIdentityRef),
    sessionId: input.sessionId,
    status,
    updatedAt: stamp(input.now),
  };
  registry.upsertPresence(record);
  return { ok: true, value: record };
}

/** Open a Collaborative Session (≠ ENGINE Session). */
export function openCollaborativeSession(
  registry: CollabSupportingRegistry,
  input: OpenCollaborativeSessionInput,
): CollabSupportingOperationResult<CollabCollaborativeSessionMetadata> {
  const peerIdentityRef = input.peerIdentityRef.trim();
  const openedByActorId = input.openedByActorId.trim();
  const label = input.label.trim();
  if (!peerIdentityRef) return { ok: false, error: "peerIdentityRef is required" };
  if (!openedByActorId) return { ok: false, error: "openedByActorId is required" };
  if (!label) return { ok: false, error: "label is required" };

  const now = stamp(input.now);
  const session: CollabCollaborativeSessionMetadata = {
    id: nextId("ccs") as CollabCollaborativeSessionMetadata["id"],
    peerIdentityRef: asCollabPeerIdentityRef(peerIdentityRef),
    openedByActorId: asCollabActorId(openedByActorId),
    label,
    status: "open",
    createdAt: now,
  };
  registry.upsertSession(session);
  return { ok: true, value: session };
}

/** Close a Collaborative Session for active participation (not scientific delete). */
export function closeCollaborativeSession(
  registry: CollabSupportingRegistry,
  input: CloseCollaborativeSessionInput,
): CollabSupportingOperationResult<CollabCollaborativeSessionMetadata> {
  const actorId = input.actorId.trim();
  if (!actorId) return { ok: false, error: "actorId is required" };

  const existing = registry.getSession(input.sessionId);
  if (!existing) return { ok: false, error: "session not found" };
  if (existing.status === "closed") {
    return { ok: false, error: "session already closed" };
  }

  const closed: CollabCollaborativeSessionMetadata = {
    ...existing,
    status: "closed",
    closedAt: stamp(input.now),
  };
  registry.upsertSession(closed);
  return { ok: true, value: closed };
}

/** Append an Activity Timeline event (≠ Scientific History). */
export function recordActivity(
  registry: CollabSupportingRegistry,
  input: RecordActivityInput,
): CollabSupportingOperationResult<CollabActivityEventMetadata> {
  const actorId = input.actorId.trim();
  const peerIdentityRef = input.peerIdentityRef.trim();
  const operation = input.operation.trim();
  if (!actorId) return { ok: false, error: "actorId is required" };
  if (!peerIdentityRef) return { ok: false, error: "peerIdentityRef is required" };
  if (!operation) return { ok: false, error: "operation is required" };

  if (input.sessionId) {
    const session = registry.getSession(input.sessionId);
    if (!session) return { ok: false, error: "session not found" };
  }

  const event: CollabActivityEventMetadata = {
    id: nextId("cae") as CollabActivityEventMetadata["id"],
    actorId: asCollabActorId(actorId),
    peerIdentityRef: asCollabPeerIdentityRef(peerIdentityRef),
    operation,
    sessionId: input.sessionId,
    createdAt: stamp(input.now),
  };
  registry.appendActivity(event);
  return { ok: true, value: event };
}

/** Emit a collaborative-event Notification (metadata notice; no external backend). */
export function emitNotification(
  registry: CollabSupportingRegistry,
  input: EmitNotificationInput,
): CollabSupportingOperationResult<CollabNotificationMetadata> {
  const recipientActorId = input.recipientActorId.trim();
  const peerIdentityRef = input.peerIdentityRef.trim();
  const eventKind = input.eventKind.trim();
  const body = input.body.trim();
  if (!recipientActorId) return { ok: false, error: "recipientActorId is required" };
  if (!peerIdentityRef) return { ok: false, error: "peerIdentityRef is required" };
  if (!eventKind) return { ok: false, error: "eventKind is required" };
  if (!body) return { ok: false, error: "body is required" };

  const notification: CollabNotificationMetadata = {
    id: nextId("cnf") as CollabNotificationMetadata["id"],
    recipientActorId: asCollabActorId(recipientActorId),
    peerIdentityRef: asCollabPeerIdentityRef(peerIdentityRef),
    eventKind,
    body,
    createdAt: stamp(input.now),
  };
  registry.appendNotification(notification);
  return { ok: true, value: notification };
}
