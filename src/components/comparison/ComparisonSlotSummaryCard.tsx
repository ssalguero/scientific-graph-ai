"use client";

import {
  formatDatasetAnalysisProfileMiniSummary,
  type DatasetAnalysisProfile,
} from "@/lib/scientific/comparison";

const contentPanel =
  "rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2.5 text-sm text-[var(--app-text)] transition-colors duration-200";

type ComparisonSlotSummaryCardProps = {
  slotLabel: string;
  profile: DatasetAnalysisProfile;
};

export function ComparisonSlotSummaryCard({
  slotLabel,
  profile,
}: ComparisonSlotSummaryCardProps) {
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

  return (
    <div className={`${contentPanel} flex flex-col gap-1`}>
      <p className="text-xs font-semibold text-[var(--app-text-muted)]">
        {slotLabel}
      </p>
      <p className="text-sm font-semibold text-[var(--app-heading)]">
        {profile.datasetInfo.fileName}
      </p>
      <p className="text-xs text-[var(--app-text-muted)]">
        {profile.seriesCount} series · {profile.totalObservations} obs.
      </p>
      <p className="text-xs text-[var(--app-text-muted)]">
        Capturado: {new Date(profile.capturedAt).toLocaleString()}
      </p>
      <p className="text-xs text-[var(--app-text-muted)]">
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
        <p className="text-xs text-[var(--app-text-muted)]">
          Motores al capturar: {enginesCaptured}/6
          {engineFlags && engineFlags.normalityAssessmentCount > 0
            ? ` · normalidad (${engineFlags.normalityAssessmentCount} series)`
            : ""}
        </p>
      ) : null}
    </div>
  );
}
