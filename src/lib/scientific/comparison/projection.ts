import {
  isCitableScientificSnapshot,
  projectCitableScientificSnapshot,
  type ScientificFreshnessAssessment,
  type ScientificProjectionSurface,
  type ScientificSemanticProjection,
  type ScientificSemanticValue,
} from "@/lib/scientific/contracts";
import type { DatasetAnalysisProfile } from "./types";

export const projectDatasetAnalysisProfile = (
  profile: DatasetAnalysisProfile,
  surface: ScientificProjectionSurface,
  freshness?: ScientificFreshnessAssessment
): ScientificSemanticProjection | null => {
  const snapshot = profile.captureMetadata?.snapshot;
  return isCitableScientificSnapshot(snapshot)
    ? projectCitableScientificSnapshot(snapshot, surface, freshness)
    : null;
};

export const findProjectedSemanticValue = (
  projection: ScientificSemanticProjection | null,
  field: string
): ScientificSemanticValue | null =>
  projection?.semanticValues.find((value) => value.field === field) ?? null;

export const readProjectedNumber = (
  projection: ScientificSemanticProjection | null,
  field: string
): number | null => {
  const value = findProjectedSemanticValue(projection, field);
  return typeof value?.value === "number" && Number.isFinite(value.value)
    ? value.value
    : null;
};

export const readProjectedString = (
  projection: ScientificSemanticProjection | null,
  field: string
): string | null => {
  const value = findProjectedSemanticValue(projection, field);
  return typeof value?.value === "string" ? value.value : null;
};

export const buildScientificProjectionDisclosureLines = (
  projection: ScientificSemanticProjection | null
): string[] => {
  if (!projection) {
    return [
      "Semántica: perfil heredado sin snapshot citable; identidad, vigencia y paridad son UNKNOWN.",
    ];
  }

  const lines: string[] = [];
  if (projection.artifactIdentity.kind === "citable-scientific-snapshot") {
    lines.push(`Snapshot: ${projection.artifactIdentity.snapshotId}.`);
  } else {
    lines.push("Artefacto: resultado derivado vivo, no citable.");
  }
  lines.push(
    `Método: ${projection.methodIdentity.label} (${projection.methodIdentity.id}${projection.methodIdentity.version ? ` v${projection.methodIdentity.version}` : ""}).`
  );
  lines.push(
    `Fuente: ${projection.sourceIdentity.dataset.label ?? projection.sourceIdentity.dataset.id}; ${projection.sourceIdentity.series.length} series.`
  );
  lines.push(
    `Vigencia: ${projection.freshness.state}. ${projection.freshness.reasons.join(" ")}`
  );
  lines.push(
    `Aproximación: ${projection.approximation.kind}. ${projection.approximation.details}`
  );

  const units = [
    ...new Set(
      projection.semanticValues
        .filter((value) => value.status === "known" && value.unit)
        .map((value) => value.unit!)
    ),
  ];
  const unknownUnitFields = projection.semanticValues
    .filter((value) => value.status === "unknown" && !value.unit)
    .map((value) => value.field);
  if (units.length > 0) {
    lines.push(`Unidades declaradas: ${units.join(", ")}.`);
  }
  if (unknownUnitFields.length > 0) {
    lines.push(
      `Unidades no autoritativas o desconocidas: ${unknownUnitFields.join(", ")}.`
    );
  }

  const uncertaintyFields = projection.semanticValues
    .filter((value) => value.uncertainty)
    .map((value) => `${value.field} (${value.uncertainty!.kind})`);
  if (uncertaintyFields.length > 0) {
    lines.push(`Incertidumbre preservada: ${uncertaintyFields.join(", ")}.`);
  }
  projection.warnings.forEach((warning) =>
    lines.push(`Advertencia [${warning.code}]: ${warning.message}`)
  );
  projection.limitations.forEach((limitation) =>
    lines.push(`Limitación: ${limitation}`)
  );
  return lines;
};
