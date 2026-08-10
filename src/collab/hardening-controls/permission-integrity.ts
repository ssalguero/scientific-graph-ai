/**
 * COLLAB-I9 — Permission integrity checks (P10 §5 · P6 I9).
 *
 * Does not redesign the I3 permission matrix. Verifies consistency and fail-closed.
 */

import { COLLAB_COLLABORATIVE_ACTIONS } from "../permissions/actions";
import { evaluatePermission } from "../permissions/evaluate";
import { COLLAB_PERMISSION_MATRIX } from "../permissions/matrix";
import { COLLAB_CONCEPTUAL_ROLES } from "../membership/roles";

export type CollabPermissionIntegrityReport = {
  readonly ok: boolean;
  readonly matrixCoversAllRoles: boolean;
  readonly unknownRoleDenied: boolean;
  readonly unknownActionDenied: boolean;
  readonly viewerCannotEscalate: boolean;
  readonly failClosed: boolean;
  readonly details: readonly string[];
};

/** Verify permission matrix integrity and fail-closed evaluation (P10). */
export function verifyPermissionIntegrity(): CollabPermissionIntegrityReport {
  const details: string[] = [];

  const matrixCoversAllRoles = COLLAB_CONCEPTUAL_ROLES.every(
    (role) => role in COLLAB_PERMISSION_MATRIX,
  );
  if (!matrixCoversAllRoles) details.push("matrix missing a conceptual role");

  const unknownRole = evaluatePermission({
    role: "Superuser",
    action: "view-collaboration",
  });
  const unknownRoleDenied = unknownRole.ok === false;
  if (!unknownRoleDenied) details.push("unknown role was not rejected");

  const unknownAction = evaluatePermission({
    role: "Owner",
    action: "delete-universe",
  });
  const unknownActionDenied = unknownAction.ok === false;
  if (!unknownActionDenied) details.push("unknown action was not rejected");

  const viewerShare = evaluatePermission({
    role: "Viewer",
    action: "share-project",
  });
  const viewerContribute = evaluatePermission({
    role: "Viewer",
    action: "contribute-metadata",
  });
  const viewerCannotEscalate =
    viewerShare.ok === true &&
    viewerShare.decision.allowed === false &&
    viewerContribute.ok === true &&
    viewerContribute.decision.allowed === false;
  if (!viewerCannotEscalate) {
    details.push("Viewer silently escalated beyond intended authority");
  }

  const viewerAllowed = COLLAB_PERMISSION_MATRIX.Viewer;
  const viewerOnlyView =
    viewerAllowed.length === 1 && viewerAllowed[0] === "view-collaboration";
  if (!viewerOnlyView) details.push("Viewer matrix is not least-privilege view-only");

  const ownerHasAll = COLLAB_COLLABORATIVE_ACTIONS.every((action) =>
    (COLLAB_PERMISSION_MATRIX.Owner as readonly string[]).includes(action),
  );
  if (!ownerHasAll) details.push("Owner matrix incomplete relative to action catalog");

  const failClosed = unknownRoleDenied && unknownActionDenied && viewerCannotEscalate;

  return {
    ok:
      matrixCoversAllRoles &&
      failClosed &&
      viewerOnlyView &&
      ownerHasAll &&
      details.length === 0,
    matrixCoversAllRoles,
    unknownRoleDenied,
    unknownActionDenied,
    viewerCannotEscalate,
    failClosed,
    details,
  };
}
