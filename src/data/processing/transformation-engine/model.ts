/**
 * DATA Domain — Transformation request / result model (DATA-P2 / DATA-I5).
 *
 * Kind labels bind to frozen Transformation Capability Group entries.
 * Parameters are opaque; execution is deterministic infrastructure only —
 * no discipline-specific scientific algorithms in DATA-I5.
 *
 * @packageDocumentation
 */

import type { TransitionRequester } from "../../internal/lifecycle/authority";

/** Frozen transformation kinds (public catalog binding — DATA-P9 / ROADMAP). */
export const TransformationKind = {
  normalize: "normalize",
  filter: "filter",
  aggregate: "aggregate",
  interpolate: "interpolate",
  transform: "transform",
} as const;

export type TransformationKind =
  (typeof TransformationKind)[keyof typeof TransformationKind];

export const TRANSFORMATION_KINDS = [
  TransformationKind.normalize,
  TransformationKind.filter,
  TransformationKind.aggregate,
  TransformationKind.interpolate,
  TransformationKind.transform,
] as const satisfies readonly TransformationKind[];

export function isTransformationKind(value: string): value is TransformationKind {
  return (TRANSFORMATION_KINDS as readonly string[]).includes(value);
}

/**
 * Explicit transformation request — no implicit transforms.
 * Operates on an Authoritative source identity; never mutates it in place.
 */
export interface TransformationRequest {
  readonly sourceIdentityId: string;
  readonly kind: TransformationKind;
  /** Opaque deterministic parameters (JSON-serializable). */
  readonly parameters?: Readonly<Record<string, unknown>>;
  readonly requester: TransitionRequester;
  readonly note?: string;
}

/** Deterministic execution descriptor (not a scientific payload schema). */
export interface TransformationExecutionDescriptor {
  readonly kind: TransformationKind;
  readonly sourceIdentityId: string;
  readonly parametersFingerprint: string;
  readonly resultFingerprint: string;
}

export interface TransformationReport {
  readonly transformationId: string;
  readonly sourceIdentityId: string;
  readonly derivedIdentityId: string;
  readonly kind: TransformationKind;
  readonly descriptor: TransformationExecutionDescriptor;
  readonly parentLifecycleAfter: string;
  readonly derivedLifecycleState: string;
  readonly metadataPropagated: boolean;
  readonly at: number;
}

export interface TransformationResult {
  readonly ok: boolean;
  readonly sourceIdentityId: string;
  readonly derivedIdentityId?: string;
  readonly report?: TransformationReport;
  readonly error?: string;
}
