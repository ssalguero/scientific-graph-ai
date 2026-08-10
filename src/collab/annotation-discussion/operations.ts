/**
 * COLLAB-I4 — Annotation / Discussion metadata operations (P2 · P3 C5–C6 · P5 Collaborate).
 *
 * Does not mutate peer entities. Does not implement review (I5) or presence (I6).
 */

import {
  asCollabActorId,
  asCollabPeerIdentityRef,
} from "../membership/types";
import { COLLAB_I4_LIFECYCLE_STAGE } from "./lifecycle";
import type { CollabAnnotationDiscussionRegistry } from "./registry";
import type {
  CollabAnnotationKind,
  CollabAnnotationMetadata,
  CollabDiscussionMessageMetadata,
  CollabDiscussionMetadata,
} from "./types";

export type CreateAnnotationInput = {
  readonly peerIdentityRef: string;
  readonly authorActorId: string;
  readonly body: string;
  readonly kind?: CollabAnnotationKind;
  readonly now?: string;
};

export type CreateDiscussionInput = {
  readonly peerIdentityRef: string;
  readonly createdByActorId: string;
  readonly title: string;
  readonly now?: string;
};

export type PostDiscussionMessageInput = {
  readonly discussionId: CollabDiscussionMetadata["id"];
  readonly authorActorId: string;
  readonly body: string;
  readonly now?: string;
};

export type CollabAnnotationDiscussionOperationResult<T> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: string };

let seq = 0;
const nextId = (prefix: string): string => {
  seq += 1;
  return `${prefix}-${seq}`;
};

const stamp = (now?: string): string => now ?? new Date(0).toISOString();

/** Attach an Annotation or Scientific Comment to a peer identity (metadata only). */
export function createAnnotation(
  registry: CollabAnnotationDiscussionRegistry,
  input: CreateAnnotationInput,
): CollabAnnotationDiscussionOperationResult<CollabAnnotationMetadata> {
  const peerIdentityRef = input.peerIdentityRef.trim();
  const authorActorId = input.authorActorId.trim();
  const body = input.body.trim();
  if (!peerIdentityRef) return { ok: false, error: "peerIdentityRef is required" };
  if (!authorActorId) return { ok: false, error: "authorActorId is required" };
  if (!body) return { ok: false, error: "body is required" };

  const kind: CollabAnnotationKind = input.kind ?? "annotation";
  if (kind !== "annotation" && kind !== "scientific-comment") {
    return { ok: false, error: "kind must be annotation or scientific-comment" };
  }

  const annotation: CollabAnnotationMetadata = {
    id: nextId("can") as CollabAnnotationMetadata["id"],
    kind,
    peerIdentityRef: asCollabPeerIdentityRef(peerIdentityRef),
    authorActorId: asCollabActorId(authorActorId),
    body,
    lifecycleStage: COLLAB_I4_LIFECYCLE_STAGE,
    createdAt: stamp(input.now),
  };
  registry.upsertAnnotation(annotation);
  return { ok: true, value: annotation };
}

/** Convenience: Scientific Comment is an annotation kind (P2 vocabulary). */
export function createScientificComment(
  registry: CollabAnnotationDiscussionRegistry,
  input: Omit<CreateAnnotationInput, "kind">,
): CollabAnnotationDiscussionOperationResult<CollabAnnotationMetadata> {
  return createAnnotation(registry, { ...input, kind: "scientific-comment" });
}

/** Open a Discussion thread about a peer identity. */
export function createDiscussion(
  registry: CollabAnnotationDiscussionRegistry,
  input: CreateDiscussionInput,
): CollabAnnotationDiscussionOperationResult<CollabDiscussionMetadata> {
  const peerIdentityRef = input.peerIdentityRef.trim();
  const createdByActorId = input.createdByActorId.trim();
  const title = input.title.trim();
  if (!peerIdentityRef) return { ok: false, error: "peerIdentityRef is required" };
  if (!createdByActorId) return { ok: false, error: "createdByActorId is required" };
  if (!title) return { ok: false, error: "title is required" };

  const discussion: CollabDiscussionMetadata = {
    id: nextId("cds") as CollabDiscussionMetadata["id"],
    peerIdentityRef: asCollabPeerIdentityRef(peerIdentityRef),
    title,
    createdByActorId: asCollabActorId(createdByActorId),
    lifecycleStage: COLLAB_I4_LIFECYCLE_STAGE,
    createdAt: stamp(input.now),
  };
  registry.upsertDiscussion(discussion);
  return { ok: true, value: discussion };
}

/** Post a message into an existing Discussion thread. */
export function postDiscussionMessage(
  registry: CollabAnnotationDiscussionRegistry,
  input: PostDiscussionMessageInput,
): CollabAnnotationDiscussionOperationResult<CollabDiscussionMessageMetadata> {
  const authorActorId = input.authorActorId.trim();
  const body = input.body.trim();
  if (!authorActorId) return { ok: false, error: "authorActorId is required" };
  if (!body) return { ok: false, error: "body is required" };

  const discussion = registry.getDiscussion(input.discussionId);
  if (!discussion) return { ok: false, error: "discussion not found" };

  const message: CollabDiscussionMessageMetadata = {
    id: nextId("cdm") as CollabDiscussionMessageMetadata["id"],
    discussionId: discussion.id,
    authorActorId: asCollabActorId(authorActorId),
    body,
    lifecycleStage: COLLAB_I4_LIFECYCLE_STAGE,
    createdAt: stamp(input.now),
  };
  registry.upsertMessage(message);
  return { ok: true, value: message };
}
