/**
 * COLLAB-I1 — Cross-domain peer seam markers (P4 §4).
 *
 * Conceptual contract boundaries (I1). Runtime adapters realized in COLLAB-I8.
 */

export const COLLAB_PEER_SEAM_IDS = [
  "collab-engine",
  "collab-data",
  "collab-ux",
  "collab-ai-peer",
] as const;

export type CollabPeerSeamId = (typeof COLLAB_PEER_SEAM_IDS)[number];

export type CollabPeerSeamMarker = {
  readonly seamId: CollabPeerSeamId;
  readonly peer: "ENGINE" | "DATA" | "UX" | "AI";
  readonly direction: string;
  readonly consumes: string;
  readonly exposes: string;
  readonly neverOwns: string;
  readonly responsibility: string;
  /** True when the peer is independent — no COLLAB dependency edge (P1 / P4 §4.4). */
  readonly dependencyEdge: boolean;
};

export const COLLAB_PEER_SEAM_MARKERS: readonly CollabPeerSeamMarker[] = [
  {
    seamId: "collab-engine",
    peer: "ENGINE",
    direction: "COLLAB participates under ENGINE coordination",
    consumes: "Workflow / Product Flow participation signals; ENGINE coordination context",
    exposes:
      "Collaboration participation outcomes and metadata for flow continuation",
    neverOwns: "Workflow orchestration, Product Flows, ENGINE Session",
    responsibility: "C1 Collaboration Coordinator extends flows; never replaces ENGINE",
    dependencyEdge: true,
  },
  {
    seamId: "collab-data",
    peer: "DATA",
    direction: "COLLAB → DATA (identity reference only)",
    consumes: "Certified scientific entity identities / stable references",
    exposes: "Collaboration metadata attached to peer identities",
    neverOwns: "Scientific objects, scientific truth, processing, Scientific History",
    responsibility: "C11 Metadata Coordination + C4–C6 attachment references",
    dependencyEdge: true,
  },
  {
    seamId: "collab-ux",
    peer: "UX",
    direction: "COLLAB exposes state for UX presentation via ENGINE coordination",
    consumes: "Presentation-ready collaboration state requests coordinated through ENGINE",
    exposes: "Collaboration state sources for presentation (owned by UX)",
    neverOwns: "Presentation, UI, Design System",
    responsibility: "State sources only; UX never reaches COLLAB internals bypassing ENGINE",
    dependencyEdge: true,
  },
  {
    seamId: "collab-ai-peer",
    peer: "AI",
    direction: "Peer interaction only — no COLLAB dependency edge on AI",
    consumes: "Optional AI assistance via proper peer boundaries (Collaborative AI = Future Evolution)",
    exposes: "Collaboration context metadata AI may consume without owning",
    neverOwns: "AI reasoning, AI decisions, intelligence generation",
    responsibility: "No v1 Collaborative AI contract; extension point only",
    dependencyEdge: false,
  },
] as const;
