"use client";

import {
  formatComparisonNumericDelta,
  type MultiDatasetComparisonAnalysis,
} from "@/lib/scientific/comparison";
import { ComparisonKpiTable } from "./ComparisonKpiTable";
import { ComparisonMultivariateSection } from "./ComparisonMultivariateSection";
import { partitionComparisonKpiRows } from "./comparisonKpiGroups";
import { ComparisonPowerSection } from "./ComparisonPowerSection";
import { ComparisonPublicationSection } from "./ComparisonPublicationSection";
import { ComparisonSlotSummaryCard } from "./ComparisonSlotSummaryCard";

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
  const { core, methodological, enriched } = partitionComparisonKpiRows(
    analysis.kpiRows
  );

  return (
    <div className="w-full mt-3 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <ComparisonSlotSummaryCard slotLabel="Slot A" profile={analysis.slotA} />
        <ComparisonSlotSummaryCard slotLabel="Slot B" profile={analysis.slotB} />
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

      <ComparisonKpiTable rows={core} />

      {analysis.methodologicalBreakdownAvailable &&
      methodological.length > 0 ? (
        <ComparisonKpiTable
          rows={methodological}
          heading="Motores metodológicos (SCI-50→55)"
        />
      ) : null}

      {enriched.length > 0 ? (
        <ComparisonKpiTable
          rows={enriched}
          heading="Dimensiones ampliadas"
        />
      ) : null}

      {analysis.multivariateSectionAvailable ? (
        <ComparisonMultivariateSection
          slotA={analysis.slotA}
          slotB={analysis.slotB}
        />
      ) : null}

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

      <ComparisonPowerSection slotA={analysis.slotA} slotB={analysis.slotB} />

      {analysis.publicationHighlightsAvailable ? (
        <ComparisonPublicationSection
          slotA={analysis.slotA}
          slotB={analysis.slotB}
        />
      ) : null}

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
