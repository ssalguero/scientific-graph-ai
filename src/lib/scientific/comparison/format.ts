import { getEffectMagnitudeLabel } from "@/lib/scientific/inference";
import {
  getEvidenceStrengthClassificationLabel,
  getPublicationReadinessClassificationLabel,
} from "./labels";
import type {
  ComparisonDeltaDirection,
  DatasetAnalysisProfile,
  DatasetAnalysisProfileMethodologicalSnapshot,
  DatasetAnalysisProfileMultivariateSnapshot,
} from "./types";

export const formatComparisonNumericDelta = (delta: number | null): string => {
  if (delta === null || !Number.isFinite(delta)) {
    return "—";
  }
  const prefix = delta > 0 ? "+" : "";
  return `${prefix}${delta.toFixed(1)}`;
};

export const formatProfileReadinessValue = (
  profile: DatasetAnalysisProfile
): string => {
  if (profile.readinessScore === undefined) {
    return "—";
  }
  const label = profile.readinessClassification
    ? getPublicationReadinessClassificationLabel(
        profile.readinessClassification
      )
    : "";
  return `${profile.readinessScore.toFixed(1)}${label ? ` (${label})` : ""}`;
};

export const formatProfileEvidenceValue = (
  profile: DatasetAnalysisProfile
): string => {
  if (profile.evidenceScore === undefined) {
    return "—";
  }
  const label = profile.evidenceClassification
    ? getEvidenceStrengthClassificationLabel(profile.evidenceClassification)
    : "";
  return `${profile.evidenceScore.toFixed(1)}${label ? ` (${label})` : ""}`;
};

export const formatProfilePublicationStatusValue = (
  profile: DatasetAnalysisProfile
): string => {
  if (!profile.publicationStatus) {
    return "—";
  }
  return getPublicationReadinessClassificationLabel(profile.publicationStatus);
};

export const formatProfileEffectValue = (
  profile: DatasetAnalysisProfile
): string => {
  if (!profile.inferential?.dominantMagnitude) {
    return "—";
  }
  const magnitude = getEffectMagnitudeLabel(
    profile.inferential.dominantMagnitude
  );
  const metric = profile.inferential.metric ?? "efecto";
  const value = profile.inferential.valueDisplay ?? "";
  return value
    ? `${magnitude} · ${metric} ${value}`
    : `${magnitude} · ${metric}`;
};

export const formatProfileMethodologicalScore = (
  score: number | undefined
): string => {
  if (score === undefined || !Number.isFinite(score)) {
    return "—";
  }
  return score.toFixed(1);
};

export const formatProfileMethodologicalCard = (
  snapshot: DatasetAnalysisProfileMethodologicalSnapshot | undefined,
  key: keyof Omit<
    DatasetAnalysisProfileMethodologicalSnapshot,
    "evaluatedEngines"
  >
): string => formatProfileMethodologicalScore(snapshot?.[key]);

export const formatProfileMultivariateValue = (
  snapshot: DatasetAnalysisProfileMultivariateSnapshot | undefined
): string => {
  if (!snapshot?.headline) {
    if (snapshot?.pcaVariance !== undefined) {
      return `PCA ${snapshot.pcaVariance.toFixed(1)}%`;
    }
    return "—";
  }
  return snapshot.headline;
};

export const formatProfileProspectiveSampleSize = (
  profile: DatasetAnalysisProfile
): string => {
  const size =
    profile.inferential?.prospectiveSampleSize ??
    profile.publication?.prospectiveSampleSize;
  if (size === undefined || size === null || !Number.isFinite(size)) {
    return "—";
  }
  return String(size);
};

export const formatDatasetAnalysisProfileMiniSummary = (
  profile: DatasetAnalysisProfile
): string => {
  const parts: string[] = [];
  if (profile.readinessScore !== undefined) {
    parts.push(`R ${profile.readinessScore.toFixed(1)}`);
  }
  if (profile.overallHealthScore !== undefined) {
    parts.push(`H ${profile.overallHealthScore.toFixed(1)}`);
  }
  if (profile.evidenceScore !== undefined) {
    parts.push(`E ${profile.evidenceScore.toFixed(1)}`);
  }
  if (profile.methodological?.evaluatedEngines) {
    parts.push(`M ${profile.methodological.evaluatedEngines}/6`);
  }
  return parts.length > 0 ? parts.join(" · ") : "Perfil parcial";
};

export const getComparisonDeltaDirectionLabel = (
  direction: ComparisonDeltaDirection
): string => {
  if (direction === "improved") return "Mejora";
  if (direction === "regressed") return "Regresión";
  if (direction === "stable") return "Estable";
  return "N/A";
};
