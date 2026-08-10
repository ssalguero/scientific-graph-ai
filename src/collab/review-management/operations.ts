/**
 * COLLAB-I5 — Review Coordination operations (P2 · P3 C4 · P5).
 *
 * Lifecycle adherence: Review ↔ Revise · Review → Approve.
 * Does not mutate peer entities. Does not implement Archive (deferred) or I6+.
 */

import {
  asCollabActorId,
  asCollabPeerIdentityRef,
} from "../membership/types";
import {
  COLLAB_I5_INITIAL_STAGE,
  isLegalCollabI5Transition,
  type CollabI5LifecycleStage,
} from "./lifecycle";
import type { CollabReviewRegistry } from "./registry";
import type { CollabReviewMetadata } from "./types";

export type StartReviewInput = {
  readonly peerIdentityRef: string;
  readonly openedByActorId: string;
  readonly title: string;
  readonly now?: string;
};

export type ReviewTransitionInput = {
  readonly reviewId: CollabReviewMetadata["id"];
  readonly actorId: string;
  readonly note?: string;
  readonly now?: string;
};

export type CollabReviewOperationResult<T> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: string };

let seq = 0;
const nextId = (prefix: string): string => {
  seq += 1;
  return `${prefix}-${seq}`;
};

const stamp = (now?: string): string => now ?? new Date(0).toISOString();

const transitionReview = (
  registry: CollabReviewRegistry,
  input: ReviewTransitionInput,
  to: CollabI5LifecycleStage,
  extras?: Partial<Pick<CollabReviewMetadata, "approvedByActorId" | "revisionNote">>,
): CollabReviewOperationResult<CollabReviewMetadata> => {
  const actorId = input.actorId.trim();
  if (!actorId) return { ok: false, error: "actorId is required" };

  const existing = registry.getReview(input.reviewId);
  if (!existing) return { ok: false, error: "review not found" };

  if (existing.lifecycleStage === "Approve") {
    return { ok: false, error: "review already approved; further transitions closed" };
  }

  if (!isLegalCollabI5Transition(existing.lifecycleStage, to)) {
    return {
      ok: false,
      error: `illegal lifecycle transition ${existing.lifecycleStage} → ${to}`,
    };
  }

  const updated: CollabReviewMetadata = {
    ...existing,
    lifecycleStage: to,
    updatedAt: stamp(input.now),
    ...extras,
    ...(input.note !== undefined
      ? { revisionNote: input.note.trim() || existing.revisionNote }
      : {}),
  };
  registry.upsertReview(updated);
  return { ok: true, value: updated };
};

/** Open Review Coordination on a peer identity (Collaborate → Review). */
export function startReview(
  registry: CollabReviewRegistry,
  input: StartReviewInput,
): CollabReviewOperationResult<CollabReviewMetadata> {
  const peerIdentityRef = input.peerIdentityRef.trim();
  const openedByActorId = input.openedByActorId.trim();
  const title = input.title.trim();
  if (!peerIdentityRef) return { ok: false, error: "peerIdentityRef is required" };
  if (!openedByActorId) return { ok: false, error: "openedByActorId is required" };
  if (!title) return { ok: false, error: "title is required" };

  const now = stamp(input.now);
  const review: CollabReviewMetadata = {
    id: nextId("crv") as CollabReviewMetadata["id"],
    peerIdentityRef: asCollabPeerIdentityRef(peerIdentityRef),
    openedByActorId: asCollabActorId(openedByActorId),
    lifecycleStage: COLLAB_I5_INITIAL_STAGE,
    title,
    createdAt: now,
    updatedAt: now,
  };
  registry.upsertReview(review);
  return { ok: true, value: review };
}

/** Review → Revise: record revision intent as collaboration metadata. */
export function requestRevision(
  registry: CollabReviewRegistry,
  input: ReviewTransitionInput,
): CollabReviewOperationResult<CollabReviewMetadata> {
  return transitionReview(registry, input, "Revise", {
    revisionNote: input.note?.trim() || undefined,
  });
}

/** Revise → Review: resume Review after revision metadata. */
export function resumeReview(
  registry: CollabReviewRegistry,
  input: ReviewTransitionInput,
): CollabReviewOperationResult<CollabReviewMetadata> {
  return transitionReview(registry, input, "Review");
}

/** Review → Approve: record approval as collaboration metadata (not scientific certification). */
export function approveReview(
  registry: CollabReviewRegistry,
  input: ReviewTransitionInput,
): CollabReviewOperationResult<CollabReviewMetadata> {
  const actorId = input.actorId.trim();
  if (!actorId) return { ok: false, error: "actorId is required" };
  return transitionReview(registry, input, "Approve", {
    approvedByActorId: asCollabActorId(actorId),
  });
}
