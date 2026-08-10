/**
 * COLLAB-I9 — Shared-access abuse resistance (P6 I9 · P10 §8 malicious shared access).
 *
 * Contain privilege-escalation attempts within collaboration metadata.
 * Does not elevate into DATA/ENGINE ownership.
 */

import { evaluatePermission } from "../permissions/evaluate";
import type { CollabConceptualRole } from "../membership/roles";
import { COLLAB_CONCEPTUAL_ROLES, isCollabConceptualRole } from "../membership/roles";

export type CollabPrivilegeEscalationAttempt = {
  readonly actorRole: string;
  readonly claimedRole: string;
  readonly action: string;
};

export type CollabAbuseResistanceReport = {
  readonly ok: boolean;
  readonly escalationsBlocked: number;
  readonly containedInCollaborationMetadata: true;
  readonly elevatesToDataOrEngine: false;
  readonly details: readonly string[];
};

const PRIVILEGED_ACTIONS = [
  "share-project",
  "manage-membership",
  "assign-role",
  "admit-member",
] as const;

/**
 * Detect and block shared-access abuse: a lower role claiming a higher role's action.
 * Evaluation uses the actor's actual role only (claimed role ignored for authority).
 */
export function resistSharedAccessAbuse(
  attempt: CollabPrivilegeEscalationAttempt,
): { readonly blocked: boolean; readonly reason: string } {
  if (!isCollabConceptualRole(attempt.actorRole)) {
    return { blocked: true, reason: "actor role invalid — fail closed" };
  }

  const decision = evaluatePermission({
    role: attempt.actorRole,
    action: attempt.action,
  });
  if (!decision.ok) {
    return { blocked: true, reason: decision.error };
  }
  if (!decision.decision.allowed) {
    return {
      blocked: true,
      reason: `abuse contained: ${attempt.actorRole} denied ${attempt.action}`,
    };
  }

  // Allowed for actor role — not an abuse if matrix permits.
  if (
    isCollabConceptualRole(attempt.claimedRole) &&
    attempt.claimedRole !== attempt.actorRole
  ) {
    const claimed = evaluatePermission({
      role: attempt.claimedRole,
      action: attempt.action,
    });
    if (
      claimed.ok &&
      claimed.decision.allowed &&
      !decision.decision.allowed
    ) {
      return {
        blocked: true,
        reason: "claimed-role escalation blocked",
      };
    }
  }

  return {
    blocked: false,
    reason: `action permitted for actual role ${attempt.actorRole}`,
  };
}

/** Run a fixed suite of shared-access abuse probes (Viewer/Editor escalation). */
export function verifySharedAccessAbuseResistance(): CollabAbuseResistanceReport {
  const details: string[] = [];
  let escalationsBlocked = 0;

  const probes: CollabPrivilegeEscalationAttempt[] = [
    {
      actorRole: "Viewer",
      claimedRole: "Owner",
      action: "manage-membership",
    },
    {
      actorRole: "Viewer",
      claimedRole: "Administrator",
      action: "assign-role",
    },
    {
      actorRole: "Editor",
      claimedRole: "Owner",
      action: "admit-member",
    },
    {
      actorRole: "Reviewer",
      claimedRole: "Administrator",
      action: "share-project",
    },
  ];

  for (const probe of probes) {
    const result = resistSharedAccessAbuse(probe);
    if (result.blocked) {
      escalationsBlocked += 1;
    } else {
      details.push(
        `probe not blocked: ${probe.actorRole}→${probe.claimedRole} ${probe.action}`,
      );
    }
  }

  // Sanity: privileged actions remain unavailable to Viewer.
  for (const action of PRIVILEGED_ACTIONS) {
    const r = evaluatePermission({ role: "Viewer", action });
    if (!(r.ok && r.decision.allowed === false)) {
      details.push(`Viewer not denied privileged action ${action}`);
    }
  }

  // Role catalog remains the only authority surface (no invented Superuser).
  const roleCount = COLLAB_CONCEPTUAL_ROLES.length;
  if (roleCount !== 5) {
    details.push(`unexpected conceptual role count ${roleCount}`);
  }

  return {
    ok: escalationsBlocked === probes.length && details.length === 0,
    escalationsBlocked,
    containedInCollaborationMetadata: true,
    elevatesToDataOrEngine: false,
    details,
  };
}

export type { CollabConceptualRole };
