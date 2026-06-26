"use client";

import type { DatasetAnalysisProfile } from "@/lib/scientific/comparison";

const emptyState =
  "rounded-lg border border-dashed border-[var(--app-border)] bg-[var(--app-surface-muted)] px-3 py-2 text-sm text-[var(--app-text-muted)]";

type ComparisonPublicationSectionProps = {
  slotA: DatasetAnalysisProfile;
  slotB: DatasetAnalysisProfile;
};

function renderPublicationLines(profile: DatasetAnalysisProfile): string[] {
  const publication = profile.publication;
  if (!publication) {
    return [];
  }

  const lines: string[] = [];
  publication.crossDomainDiagnosisTop?.forEach((line) => lines.push(line));
  publication.publicationRisksTop?.forEach((line) =>
    lines.push(`Riesgo: ${line}`)
  );
  return lines;
}

export function ComparisonPublicationSection({
  slotA,
  slotB,
}: ComparisonPublicationSectionProps) {
  const linesA = renderPublicationLines(slotA);
  const linesB = renderPublicationLines(slotB);

  if (linesA.length === 0 && linesB.length === 0) {
    return null;
  }

  return (
    <div>
      <p className="text-sm font-semibold text-[var(--app-heading)] mb-2">
        Highlights editoriales (SCI-60)
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {linesA.length > 0 ? (
          <div className={emptyState}>
            <p className="text-xs font-semibold text-[var(--app-heading)] mb-1">
              Slot A
            </p>
            {linesA.map((line, index) => (
              <p key={`a-${index}-${line}`}>{line}</p>
            ))}
          </div>
        ) : null}
        {linesB.length > 0 ? (
          <div className={emptyState}>
            <p className="text-xs font-semibold text-[var(--app-heading)] mb-1">
              Slot B
            </p>
            {linesB.map((line, index) => (
              <p key={`b-${index}-${line}`}>{line}</p>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
