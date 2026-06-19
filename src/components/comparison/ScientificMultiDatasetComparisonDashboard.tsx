"use client";

import {
  formatComparisonNumericDelta,
  getComparisonDeltaDirectionLabel,
  type MultiDatasetComparisonAnalysis,
} from "@/lib/scientific/comparison";

const contentPanel =
  "rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2.5 text-sm text-[var(--app-text)] transition-colors duration-200";
const emptyState =
  "rounded-lg border border-dashed border-[var(--app-border)] bg-[var(--app-surface-muted)] px-3 py-4 text-sm text-[var(--app-text-muted)] text-center transition-colors duration-200";

type ScientificMultiDatasetComparisonDashboardProps = {
  analysis: MultiDatasetComparisonAnalysis;
};

export function ScientificMultiDatasetComparisonDashboard({
  analysis,
}: ScientificMultiDatasetComparisonDashboardProps) {
  const readinessRow = analysis.kpiRows.find((row) => row.key === "readiness");

  return (
    <div className="w-full mt-3 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className={`${contentPanel} flex flex-col gap-1`}>
          <p className="text-xs font-semibold text-[var(--app-text-muted)]">
            Slot A
          </p>
          <p className="text-sm font-semibold text-[var(--app-heading)]">
            {analysis.slotA.datasetInfo.fileName}
          </p>
          <p className="text-xs text-[var(--app-text-muted)]">
            {analysis.slotA.seriesCount} series ·{" "}
            {analysis.slotA.totalObservations} obs.
          </p>
        </div>
        <div className={`${contentPanel} flex flex-col gap-1`}>
          <p className="text-xs font-semibold text-[var(--app-text-muted)]">
            Slot B
          </p>
          <p className="text-sm font-semibold text-[var(--app-heading)]">
            {analysis.slotB.datasetInfo.fileName}
          </p>
          <p className="text-xs text-[var(--app-text-muted)]">
            {analysis.slotB.seriesCount} series ·{" "}
            {analysis.slotB.totalObservations} obs.
          </p>
        </div>
      </div>

      {readinessRow &&
      readinessRow.delta !== null &&
      readinessRow.delta !== undefined ? (
        <div className={`${contentPanel} flex flex-col gap-1`}>
          <p className="text-xs font-semibold text-[var(--app-text-muted)]">
            Delta Readiness (B − A)
          </p>
          <p className="text-2xl font-semibold text-[var(--app-heading)] tabular-nums">
            {formatComparisonNumericDelta(readinessRow.delta)}
          </p>
        </div>
      ) : null}

      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-[var(--app-border)]">
              <th className="text-left py-2 pr-3 font-semibold">KPI</th>
              <th className="text-left py-2 px-3 font-semibold">Slot A</th>
              <th className="text-left py-2 px-3 font-semibold">Slot B</th>
              <th className="text-left py-2 pl-3 font-semibold">Δ (B−A)</th>
            </tr>
          </thead>
          <tbody>
            {analysis.kpiRows.map((row) => (
              <tr
                key={row.key}
                className="border-b border-[var(--app-border)]/60"
              >
                <td className="py-2 pr-3 text-[var(--app-heading)]">
                  {row.title}
                </td>
                <td className="py-2 px-3 text-[var(--app-text-muted)]">
                  {row.slotAValue}
                </td>
                <td className="py-2 px-3 text-[var(--app-text-muted)]">
                  {row.slotBValue}
                </td>
                <td className="py-2 pl-3 tabular-nums text-[var(--app-text)]">
                  {row.delta !== null
                    ? `${formatComparisonNumericDelta(row.delta)} (${getComparisonDeltaDirectionLabel(row.deltaDirection)})`
                    : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {(analysis.slotA.normality || analysis.slotB.normality) && (
        <div>
          <p className="text-sm font-semibold text-[var(--app-heading)]">
            Normalidad integrada
          </p>
          {analysis.slotA.normality ? (
            <p className={`mt-1 text-sm ${emptyState}`}>
              Slot A: normales={analysis.slotA.normality.normalCount}, no
              normales={analysis.slotA.normality.nonNormalCount}, cuestionables=
              {analysis.slotA.normality.questionableCount}.
            </p>
          ) : null}
          {analysis.slotB.normality ? (
            <p className={`mt-1 text-sm ${emptyState}`}>
              Slot B: normales={analysis.slotB.normality.normalCount}, no
              normales={analysis.slotB.normality.nonNormalCount}, cuestionables=
              {analysis.slotB.normality.questionableCount}.
            </p>
          ) : null}
        </div>
      )}

      {analysis.comparabilityWarnings.length > 0 ? (
        <div>
          <p className="text-sm font-semibold text-[var(--app-heading)]">
            Advertencias de comparabilidad
          </p>
          {analysis.comparabilityWarnings.map((warning) => (
            <p key={warning} className={`mt-1 text-sm ${emptyState}`}>
              {warning}
            </p>
          ))}
        </div>
      ) : null}

      {analysis.crossDatasetDiagnosis.length > 0 ? (
        <div>
          <p className="text-sm font-semibold text-[var(--app-heading)]">
            Diagnóstico cruzado
          </p>
          {analysis.crossDatasetDiagnosis.map((line) => (
            <p key={line} className={`mt-1 text-sm ${emptyState}`}>
              {line}
            </p>
          ))}
        </div>
      ) : null}

      {analysis.comparisonRecommendations.length > 0 ? (
        <div>
          <p className="text-sm font-semibold text-[var(--app-heading)]">
            Recomendaciones
          </p>
          {analysis.comparisonRecommendations.map((line) => (
            <p key={line} className={`mt-1 text-sm ${emptyState}`}>
              {line}
            </p>
          ))}
        </div>
      ) : null}
    </div>
  );
}
