import {
  assessScientificSnapshotFreshness,
  type ScientificFreshnessAssessment,
  type ScientificFreshnessState,
  type ScientificProvenanceDescriptor,
} from "@/lib/scientific/contracts";
import type { ComparisonCompatibilityAssessment, DatasetAnalysisProfile } from "./types";

export type ComparisonSlotFreshness = {
  state: ScientificFreshnessState;
  isStale: boolean;
  isInvalid: boolean;
  messages: string[];
  assessment: ScientificFreshnessAssessment;
};

const COMPARABLE_COMPARISON_FIELDS = new Set([
  "readinessScore",
  "overallHealthScore",
  "evidenceScore",
  "normality",
  "inferential",
  "methodological",
  "multivariate",
]);

const semanticValueShape = (value: unknown): string => {
  if (Array.isArray(value)) {
    return `array<${[...new Set(value.map(semanticValueShape))].sort().join("|")}>`;
  }
  if (value === null) {
    return "null";
  }
  if (typeof value === "object") {
    return `object<{${Object.entries(value)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, nested]) => `${key}:${semanticValueShape(nested)}`)
      .join(",")}}>`;
  }
  return typeof value;
};

export const deriveComparisonSlotFreshness = (input: {
  profile: DatasetAnalysisProfile;
  currentProvenance?: ScientificProvenanceDescriptor | null;
  sourceAvailable?: boolean | "unknown";
}): ComparisonSlotFreshness => {
  const snapshot = input.profile.captureMetadata?.snapshot;
  const assessment: ScientificFreshnessAssessment =
    snapshot && snapshot.identity.capturedAt !== input.profile.capturedAt
      ? {
          state: "INVALID",
          recomputable: "unknown",
          reasons: [
            {
              code: "SNAPSHOT_INVALID",
              message: "La fecha de captura del perfil diverge de su snapshot inmutable.",
            },
          ],
        }
      : assessScientificSnapshotFreshness({
          snapshot,
          currentResultContractId: "sci-58.comparison",
          currentProvenance: input.currentProvenance,
          sourceAvailable:
            input.profile.captureMetadata?.sourceUnavailable === true
              ? false
              : (input.sourceAvailable ?? "unknown"),
        });
  const messages = assessment.reasons.map((reason) => reason.message);
  if (input.profile.captureMetadata?.worksheetModifiedAtCapture === true) {
    messages.push("Snapshot capturado con worksheet ya modificada.");
  }
  return {
    state: assessment.state,
    isStale: assessment.state === "STALE",
    isInvalid: assessment.state === "INVALID",
    messages,
    assessment,
  };
};

export const assessComparisonCompatibility = (
  slotA: DatasetAnalysisProfile | null,
  slotB: DatasetAnalysisProfile | null,
): ComparisonCompatibilityAssessment => {
  const snapshotA = slotA?.captureMetadata?.snapshot;
  const snapshotB = slotB?.captureMetadata?.snapshot;
  if (!snapshotA || !snapshotB) {
    return {
      state: "UNKNOWN",
      reasons: ["Al menos un perfil no tiene snapshot citable para evaluar compatibilidad."],
    };
  }
  if (snapshotA.resultContractId !== snapshotB.resultContractId) {
    return {
      state: "INCOMPATIBLE",
      reasons: ["Los slots usan contratos científicos distintos."],
    };
  }

  const valuesA = new Map(
    snapshotA.semanticValues
      .filter(
        (value) =>
          value.status === "known" &&
          value.authority === "system-factual" &&
          value.equivalencePolicy !== "non-comparable" &&
          COMPARABLE_COMPARISON_FIELDS.has(value.field),
      )
      .map((value) => [value.field, value] as const),
  );
  const candidateFields = snapshotB.semanticValues.filter(
    (value) =>
      value.status === "known" &&
      value.authority === "system-factual" &&
      value.equivalencePolicy !== "non-comparable" &&
      COMPARABLE_COMPARISON_FIELDS.has(value.field) &&
      valuesA.has(value.field),
  );
  const incompatibleFields = candidateFields.filter((value) => {
    const peer = valuesA.get(value.field)!;
    return (
      peer.unit !== value.unit ||
      semanticValueShape(peer.value) !== semanticValueShape(value.value) ||
      peer.uncertainty?.kind !== value.uncertainty?.kind
    );
  });
  if (incompatibleFields.length > 0) {
    return {
      state: "INCOMPATIBLE",
      reasons: [
        `Los campos ${incompatibleFields
          .map((value) => value.field)
          .join(", ")} difieren en unidad, tipo o incertidumbre.`,
      ],
    };
  }
  const sharedFields = candidateFields.filter((value) => {
    const peer = valuesA.get(value.field)!;
    return (
      peer.unit === value.unit &&
      semanticValueShape(peer.value) === semanticValueShape(value.value) &&
      peer.uncertainty?.kind === value.uncertainty?.kind
    );
  });
  if (sharedFields.length === 0) {
    return {
      state: "INCOMPATIBLE",
      reasons: ["Los snapshots no comparten campos con unidad, tipo e incertidumbre compatibles."],
    };
  }
  return {
    state: "COMPATIBLE",
    reasons: [`Los snapshots comparten ${sharedFields.length} campos científicos comparables.`],
  };
};
