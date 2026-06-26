"use client";

import {
  formatProfileMultivariateValue,
  type DatasetAnalysisProfile,
} from "@/lib/scientific/comparison";

const emptyState =
  "rounded-lg border border-dashed border-[var(--app-border)] bg-[var(--app-surface-muted)] px-3 py-2 text-sm text-[var(--app-text-muted)]";

type ComparisonMultivariateSectionProps = {
  slotA: DatasetAnalysisProfile;
  slotB: DatasetAnalysisProfile;
};

function renderMultivariateDetail(profile: DatasetAnalysisProfile): string[] {
  const snapshot = profile.multivariate;
  if (!snapshot) {
    return [];
  }

  const lines: string[] = [];
  const headline = formatProfileMultivariateValue(snapshot);
  if (headline !== "—") {
    lines.push(headline);
  }
  if (snapshot.pcaVariance !== undefined) {
    lines.push(`Varianza PCA: ${snapshot.pcaVariance.toFixed(1)}%`);
  }
  if (snapshot.clusterCount !== undefined) {
    lines.push(`Clusters: ${snapshot.clusterCount}`);
  }
  if (snapshot.topVariable) {
    lines.push(`Variable líder: ${snapshot.topVariable}`);
  }
  if (snapshot.averageSimilarity !== undefined) {
    lines.push(`Similitud media: ${snapshot.averageSimilarity.toFixed(1)}`);
  }
  return lines;
}

export function ComparisonMultivariateSection({
  slotA,
  slotB,
}: ComparisonMultivariateSectionProps) {
  const linesA = renderMultivariateDetail(slotA);
  const linesB = renderMultivariateDetail(slotB);

  if (linesA.length === 0 && linesB.length === 0) {
    return null;
  }

  return (
    <div>
      <p className="text-sm font-semibold text-[var(--app-heading)] mb-2">
        Multivariante (SCI-40)
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
