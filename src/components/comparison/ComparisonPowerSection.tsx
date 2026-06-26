"use client";

import {
  formatProfileProspectiveSampleSize,
  type DatasetAnalysisProfile,
} from "@/lib/scientific/comparison";

const emptyState =
  "rounded-lg border border-dashed border-[var(--app-border)] bg-[var(--app-surface-muted)] px-3 py-2 text-sm text-[var(--app-text-muted)]";

type ComparisonPowerSectionProps = {
  slotA: DatasetAnalysisProfile;
  slotB: DatasetAnalysisProfile;
};

function renderPowerLines(profile: DatasetAnalysisProfile): string[] {
  const lines: string[] = [];
  const prospective = formatProfileProspectiveSampleSize(profile);
  if (prospective !== "—") {
    lines.push(`Tamaño muestral prospectivo: ${prospective}`);
  }
  if (profile.publication?.currentSampleSize !== undefined) {
    lines.push(
      `Tamaño muestral actual: ${profile.publication.currentSampleSize}`
    );
  }
  if (profile.publication?.insufficientSampleWarning) {
    lines.push(profile.publication.insufficientSampleWarning);
  }
  return lines;
}

export function ComparisonPowerSection({
  slotA,
  slotB,
}: ComparisonPowerSectionProps) {
  const linesA = renderPowerLines(slotA);
  const linesB = renderPowerLines(slotB);

  if (linesA.length === 0 && linesB.length === 0) {
    return null;
  }

  return (
    <div>
      <p className="text-sm font-semibold text-[var(--app-heading)] mb-2">
        Potencia y tamaño muestral (SCI-57)
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {linesA.length > 0 ? (
          <div className={emptyState}>
            <p className="text-xs font-semibold text-[var(--app-heading)] mb-1">
              Slot A
            </p>
            {linesA.map((line) => (
              <p key={`a-${line}`}>{line}</p>
            ))}
          </div>
        ) : null}
        {linesB.length > 0 ? (
          <div className={emptyState}>
            <p className="text-xs font-semibold text-[var(--app-heading)] mb-1">
              Slot B
            </p>
            {linesB.map((line) => (
              <p key={`b-${line}`}>{line}</p>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
