/**
 * PERFORMANCE-I6 — Domain-sequence validation (explicit, non-opaque).
 */

import { getDomainWaveTarget } from "../domain-waves/targets";
import type { PerformanceMeasurementDomain } from "../domain-waves/types";
import type { CrossDomainScenarioDefinition } from "./types";

export type SequenceValidation =
  | { readonly ok: true; readonly sequence: readonly PerformanceMeasurementDomain[] }
  | {
      readonly ok: false;
      readonly outcome: "BLOCKED" | "CONDITIONAL" | "EVIDENCE_DEPENDENCY";
      readonly reason: string;
    };

const isNonEmpty = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

export function validateCrossDomainScenario(
  scenario: CrossDomainScenarioDefinition,
): SequenceValidation {
  if (!isNonEmpty(scenario.scenarioId)) {
    return { ok: false, outcome: "BLOCKED", reason: "scenarioId must be non-empty" };
  }
  if (!isNonEmpty(scenario.label)) {
    return { ok: false, outcome: "BLOCKED", reason: "label must be non-empty" };
  }
  if (scenario.kind !== "fixture" && scenario.kind !== "definition") {
    return { ok: false, outcome: "BLOCKED", reason: "kind must be fixture|definition" };
  }
  if (!Array.isArray(scenario.domainSequence) || scenario.domainSequence.length < 2) {
    return {
      ok: false,
      outcome: "BLOCKED",
      reason: "domainSequence must include at least two domains",
    };
  }

  for (const domain of scenario.domainSequence) {
    const target = getDomainWaveTarget(domain);
    if (target.kind === "conditional") {
      return {
        ok: false,
        outcome: "CONDITIONAL",
        reason: `EVIDENCE_DEPENDENCY: domain '${domain}' is conditional — ${target.notes}`,
      };
    }
  }

  return { ok: true, sequence: scenario.domainSequence };
}

/** Reject sequences that claim optional peers without implemented adapters. */
export function isUnsupportedOptionalSequence(
  sequence: readonly PerformanceMeasurementDomain[],
): boolean {
  return sequence.some((d) => {
    const t = getDomainWaveTarget(d);
    return t.kind === "conditional";
  });
}
