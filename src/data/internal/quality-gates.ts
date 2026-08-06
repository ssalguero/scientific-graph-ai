/**
 * DATA-I9 — Quality Gate registry (DATA-P10 binding).
 *
 * Declarative only: gate IDs, purpose, pass criteria references.
 * Does not reinterpret Architecture or API Freeze.
 * Not part of the consumer Scientific Data API.
 *
 * @packageDocumentation
 */

export const DataQualityGateId = {
  G1_Architecture: "DATA-G1",
  G2_Dependency: "DATA-G2",
  G3_Boundary: "DATA-G3",
  G4_ApiFreeze: "DATA-G4",
  G5_Ownership: "DATA-G5",
  G6_Registry: "DATA-G6",
  G7_LifecycleValidation: "DATA-G7",
  G8_Documentation: "DATA-G8",
  G9_Certification: "DATA-G9",
} as const;

export type DataQualityGateId =
  (typeof DataQualityGateId)[keyof typeof DataQualityGateId];

export interface DataQualityGateDefinition {
  readonly id: DataQualityGateId;
  readonly name: string;
  readonly purpose: string;
  readonly npmScript: string;
  readonly p10Criterion: string;
}

/** Frozen ordered catalog — exactly DATA-G1…G9 from DATA-P10. */
export const DATA_QUALITY_GATES = [
  {
    id: DataQualityGateId.G1_Architecture,
    name: "Architecture",
    purpose: "Conform to frozen layers/components/invariants (P2/P8)",
    npmScript: "validate:data-g1-architecture",
    p10Criterion:
      "No unauthorized structural change; P8 compliance criteria met",
  },
  {
    id: DataQualityGateId.G2_Dependency,
    name: "Dependencies",
    purpose: "Allowed deps only (P2/P3)",
    npmScript: "validate:data-g2-dependencies",
    p10Criterion: "No forbidden domain or internal dependency edges",
  },
  {
    id: DataQualityGateId.G3_Boundary,
    name: "Boundaries",
    purpose: "Ownership/boundary protection (P3/P8)",
    npmScript: "validate:data-g3-boundaries",
    p10Criterion:
      "No UX→DATA orchestration; no DATA Product Flows/UI/persistence ownership",
  },
  {
    id: DataQualityGateId.G4_ApiFreeze,
    name: "API Freeze",
    purpose: "Public surface fidelity (P4/P9)",
    npmScript: "validate:data-g4-api-freeze",
    p10Criterion:
      "Public entries map to frozen Capability Groups/Categories; no new public capabilities",
  },
  {
    id: DataQualityGateId.G5_Ownership,
    name: "Ownership",
    purpose: "Component ownership map (P6/P8)",
    npmScript: "validate:data-g5-ownership",
    p10Criterion: "Owns/References/Never Owns respected",
  },
  {
    id: DataQualityGateId.G6_Registry,
    name: "Registry",
    purpose: "SSOT / registry authority (P6)",
    npmScript: "validate:data-g6-registry",
    p10Criterion:
      "No shadow/parallel Authoritative Registry; Supporting/Derived/Transient roles respected",
  },
  {
    id: DataQualityGateId.G7_LifecycleValidation,
    name: "Lifecycle / Validation",
    purpose: "Scientific validation gate (P5)",
    npmScript: "validate:data-g7-lifecycle",
    p10Criterion:
      "Validation before Availability/Publication; lifecycle invariants hold",
  },
  {
    id: DataQualityGateId.G8_Documentation,
    name: "Documentation",
    purpose: "Plan/docs sync",
    npmScript: "validate:data-g8-documentation",
    p10Criterion:
      "Freeze Authority / API Authority docs not contradicted; clarifications only",
  },
  {
    id: DataQualityGateId.G9_Certification,
    name: "Certification Readiness",
    purpose: "Domain certification evidence pack (I10 prep)",
    npmScript: "validate:data-g9-certification",
    p10Criterion: "Full evidence pack vs plan + gates for certified scope",
  },
] as const satisfies readonly DataQualityGateDefinition[];

export const DATA_QUALITY_GATE_COUNT = DATA_QUALITY_GATES.length;
