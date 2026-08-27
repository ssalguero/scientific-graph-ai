"use client";

import {
  buildScientificProjectionDisclosureLines,
  formatDatasetAnalysisProfileMiniSummary,
  projectDatasetAnalysisProfile,
  readProjectedNumber,
  readProjectedString,
  type DatasetAnalysisProfile,
} from "@/lib/scientific/comparison";
import type { ScientificFreshnessAssessment } from "@/lib/scientific/contracts";

const contentPanel =
  "rounded-lg border border-[var(--color-border-default)] bg-[var(--color-surface-default)] px-3 py-2.5 text-sm text-[var(--color-text-primary)] transition-colors duration-200";

type ComparisonSlotSummaryCardProps = {
  slotLabel: string;
  profile: DatasetAnalysisProfile;
  freshness?: ScientificFreshnessAssessment;
  onExportNumeric?: () => void;
};

export function ComparisonSlotSummaryCard({
  slotLabel,
  profile,
  freshness,
  onExportNumeric,
}: ComparisonSlotSummaryCardProps) {
  const projection = projectDatasetAnalysisProfile(
    profile,
    "results",
    freshness
  );
  const fileName = projection
    ? (readProjectedString(projection, "dataset.fileName") ?? "No disponible")
    : profile.datasetInfo.fileName;
  const seriesCount = projection
    ? (readProjectedNumber(projection, "seriesCount") ?? 0)
    : profile.seriesCount;
  const totalObservations = projection
    ? (readProjectedNumber(projection, "totalObservations") ?? 0)
    : profile.totalObservations;
  const capturedAt =
    projection?.artifactIdentity.kind === "citable-scientific-snapshot"
      ? projection.artifactIdentity.capturedAt
      : profile.capturedAt;
  const engineFlags = profile.captureMetadata?.captureEngineFlags;
  const enginesCaptured = engineFlags
    ? [
        engineFlags.hasMethodologicalDashboard,
        engineFlags.hasPublicationReadiness,
        engineFlags.hasEvidenceEngine,
        engineFlags.hasMultivariateDashboard,
        engineFlags.hasEffectSizePower,
        engineFlags.normalityAssessmentCount > 0,
      ].filter(Boolean).length
    : null;
  const disclosureLines = buildScientificProjectionDisclosureLines(projection);

  return (
    <div className={`${contentPanel} flex flex-col gap-1`}>
      <p className="text-xs font-semibold text-[var(--color-text-muted)]">
        {slotLabel}
      </p>
      <p className="text-sm font-semibold text-[var(--color-text-primary)]">
        {fileName}
      </p>
      <p className="text-xs text-[var(--color-text-muted)]">
        {seriesCount} series · {totalObservations} obs.
      </p>
      <p className="text-xs text-[var(--color-text-muted)]">
        Capturado: {new Date(capturedAt).toLocaleString()}
      </p>
      <p className="text-xs text-[var(--color-text-muted)]">
        {formatDatasetAnalysisProfileMiniSummary(profile)}
      </p>
      <p className="text-xs">
        <span
          className={
            profile.isComplete ? "text-emerald-600" : "text-amber-600"
          }
        >
          {profile.isComplete ? "Perfil completo" : "Perfil parcial"}
        </span>
      </p>
      {enginesCaptured !== null ? (
        <p className="text-xs text-[var(--color-text-muted)]">
          Motores al capturar: {enginesCaptured}/6
          {engineFlags && engineFlags.normalityAssessmentCount > 0
            ? ` · normalidad (${engineFlags.normalityAssessmentCount} series)`
            : ""}
        </p>
      ) : null}
      <details className="mt-1 text-xs text-[var(--color-text-muted)]">
        <summary className="cursor-pointer font-semibold">
          Identidad, proveniencia y vigencia
        </summary>
        <ul className="mt-1 space-y-1">
          {disclosureLines.map((line) => (
            <li key={line}>• {line}</li>
          ))}
        </ul>
      </details>
      {onExportNumeric ? (
        <button
          type="button"
          onClick={onExportNumeric}
          disabled={!projection}
          title={
            projection
              ? "Exportar el snapshot científico como scientific-numeric-export/v1"
              : "El perfil legado no contiene un snapshot científico autoritativo"
          }
          className="mt-2 self-start rounded border border-[var(--color-border-default)] px-2 py-1 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-50"
        >
          Exportar datos científicos JSON
        </button>
      ) : null}
    </div>
  );
}
