/**
 * COLLAB-I1 — Conceptual inventory references (P3 C1–C11).
 *
 * Markers only — not modules, classes, services, or runtime components.
 * Realization of C2–C10 is deferred to I2–I6 (DEFERRED — FUTURE COLLAB IMPLEMENTATION STAGE).
 */

export const COLLAB_INVENTORY_COMPONENT_IDS = [
  "C1",
  "C2",
  "C3",
  "C4",
  "C5",
  "C6",
  "C7",
  "C8",
  "C9",
  "C10",
  "C11",
] as const;

export type CollabInventoryComponentId =
  (typeof COLLAB_INVENTORY_COMPONENT_IDS)[number];

export type CollabInventoryComponentRef = {
  readonly id: CollabInventoryComponentId;
  readonly name: string;
  readonly realizes: string;
  /** Implementation phase that may realize this component (P6). */
  readonly deferredToPhase: string;
};

export const COLLAB_INVENTORY_COMPONENT_REFS: readonly CollabInventoryComponentRef[] =
  [
    {
      id: "C1",
      name: "Collaboration Coordinator",
      realizes: "Cross-cutting coordination; extends ENGINE workflows",
      deferredToPhase: "cross-cutting I0–I8",
    },
    {
      id: "C2",
      name: "Membership Management",
      realizes: "Sharing · Membership Management",
      deferredToPhase: "COLLAB-I2",
    },
    {
      id: "C3",
      name: "Permission Service",
      realizes: "Permission Management",
      deferredToPhase: "COLLAB-I3",
    },
    {
      id: "C4",
      name: "Review Management",
      realizes: "Review Coordination",
      deferredToPhase: "COLLAB-I5",
    },
    {
      id: "C5",
      name: "Annotation Management",
      realizes: "Annotation · Scientific Comment",
      deferredToPhase: "COLLAB-I4",
    },
    {
      id: "C6",
      name: "Discussion Management",
      realizes: "Discussion",
      deferredToPhase: "COLLAB-I4",
    },
    {
      id: "C7",
      name: "Presence Service",
      realizes: "Presence Awareness",
      deferredToPhase: "COLLAB-I6",
    },
    {
      id: "C8",
      name: "Activity Timeline",
      realizes: "Activity Tracking",
      deferredToPhase: "COLLAB-I6",
    },
    {
      id: "C9",
      name: "Notification Coordination",
      realizes: "Notifications",
      deferredToPhase: "COLLAB-I6",
    },
    {
      id: "C10",
      name: "Collaboration Session",
      realizes: "Collaborative Session (≠ ENGINE Session)",
      deferredToPhase: "COLLAB-I6",
    },
    {
      id: "C11",
      name: "Metadata Coordination",
      realizes: "Collaboration Metadata attachment to peer identities",
      deferredToPhase: "cross-cutting I0–I8",
    },
  ] as const;
