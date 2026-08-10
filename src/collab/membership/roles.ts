/**
 * COLLAB-I2 — Conceptual collaboration roles (P2 §8).
 *
 * Role association only. Permission matrices / evaluation realized in COLLAB-I3.
 */

export const COLLAB_CONCEPTUAL_ROLES = [
  "Owner",
  "Administrator",
  "Editor",
  "Reviewer",
  "Viewer",
] as const;

export type CollabConceptualRole = (typeof COLLAB_CONCEPTUAL_ROLES)[number];

export const COLLAB_CONCEPTUAL_ROLE_INTENT = {
  Owner: "Ultimate collaborative authority over sharing/membership for a Shared Project",
  Administrator: "Manages membership and collaborative configuration",
  Editor: "Participates with content-oriented collaborative contributions",
  Reviewer: "Participates in Review Coordination",
  Viewer: "Observes shared work with limited collaborative write authority",
} as const satisfies Record<CollabConceptualRole, string>;

export function isCollabConceptualRole(value: string): value is CollabConceptualRole {
  return (COLLAB_CONCEPTUAL_ROLES as readonly string[]).includes(value);
}
