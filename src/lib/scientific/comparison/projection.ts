import {
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
  return snapshot
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
