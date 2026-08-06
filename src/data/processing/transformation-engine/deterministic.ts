/**
 * DATA Domain — Deterministic transformation execution (DATA-I5).
 *
 * Produces stable fingerprints from kind + source + parameters.
 * Does not implement discipline-specific scientific algorithms.
 *
 * @packageDocumentation
 */

import type {
  TransformationExecutionDescriptor,
  TransformationKind,
  TransformationRequest,
} from "./model";
import { TransformationInvariantError } from "./invariants";

/** Stable JSON stringify with sorted object keys for determinism. */
export function stableStringify(value: unknown): string {
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return `[${value.map((v) => stableStringify(v)).join(",")}]`;
  }
  const obj = value as Record<string, unknown>;
  const keys = Object.keys(obj).sort();
  return `{${keys
    .map((k) => `${JSON.stringify(k)}:${stableStringify(obj[k])}`)
    .join(",")}}`;
}

export function parametersFingerprint(
  parameters: Readonly<Record<string, unknown>> | undefined,
): string {
  return stableStringify(parameters ?? {});
}

/**
 * Deterministic execution descriptor.
 * Same inputs ⇒ same fingerprints (reproducibility infrastructure).
 */
export function executeDeterministic(
  request: TransformationRequest,
): TransformationExecutionDescriptor {
  const paramsFp = parametersFingerprint(request.parameters);
  const resultFingerprint = stableStringify({
    kind: request.kind,
    sourceIdentityId: request.sourceIdentityId,
    parameters: request.parameters ?? {},
  });
  if (!resultFingerprint) {
    throw new TransformationInvariantError(
      "execution-must-be-deterministic",
      "empty result fingerprint",
    );
  }
  return {
    kind: request.kind as TransformationKind,
    sourceIdentityId: request.sourceIdentityId,
    parametersFingerprint: paramsFp,
    resultFingerprint,
  };
}
