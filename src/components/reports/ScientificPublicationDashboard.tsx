"use client";

import { getEvidenceStrengthEngineClassificationLabel } from "@/lib/scientific/methodology/evidence";
import { getPublicationReadinessAnalyzerClassificationLabel } from "@/lib/scientific/methodology/readiness";
import type { PublicationDashboardAnalysis } from "@/lib/scientific/methodology/publication";
import { COMPOSITE_METHODOLOGY_PRIMARY_LABELS } from "@/lib/scientific/methodology/disclosure";
import { getEffectMagnitudeLabel } from "@/lib/scientific/inference";
import { contentPanel, emptyState } from "@/lib/ui/theme";

const formatPCAVariancePercent = (value: number) => `${value.toFixed(1)}%`;

const formatVariableImportanceCoLeaders = (variables: string[]) =>
  variables.join(" / ");

type ScientificPublicationDashboardProps = {
  analysis: PublicationDashboardAnalysis;
};

export function ScientificPublicationDashboard({
  analysis,
}: ScientificPublicationDashboardProps) {
  const kpiCards: {
    key: string;
    icon: string;
    title: string;
    value: string;
    subtitle: string;
  }[] = [
    {
      key: "readiness",
      icon: "📰",
      title: "Preparación compuesta",
      value: analysis.publicationScore.toFixed(1),
      subtitle: getPublicationReadinessAnalyzerClassificationLabel(
        analysis.publicationStatus
      ),
    },
  ];

  if (analysis.methodologicalHealthScore !== undefined) {
    kpiCards.push({
      key: "health",
      icon: "📋",
      title: "Salud compuesta",
      value: analysis.methodologicalHealthScore.toFixed(1),
      subtitle: "Referencia SCI-56",
    });
  }

  if (analysis.evidenceScore !== undefined && analysis.evidenceClassification) {
    kpiCards.push({
      key: "evidence",
      icon: "🧪",
      title: "Soporte compuesto",
      value: analysis.evidenceScore.toFixed(1),
      subtitle: getEvidenceStrengthEngineClassificationLabel(
        analysis.evidenceClassification
      ),
    });
  }

  if (
    analysis.inferentialHighlight?.metric &&
    analysis.inferentialHighlight.valueDisplay
  ) {
    kpiCards.push({
      key: "effect",
      icon: "📏",
      title: "Effect Dominante",
      value: analysis.inferentialHighlight.valueDisplay,
      subtitle: `${getEffectMagnitudeLabel(
        analysis.inferentialHighlight.dominantMagnitude ?? "trivial"
      )} · ${analysis.inferentialHighlight.metric}`,
    });
  }

  return (
    <div className="w-full mt-3">
      <div className={`${contentPanel} mb-3 flex flex-col gap-1`}>
        <p className="text-xs font-semibold text-[var(--app-text-muted)]">
          {COMPOSITE_METHODOLOGY_PRIMARY_LABELS["SCI-60"]}
        </p>
        <p className="text-2xl font-semibold text-[var(--app-heading)]">
          {getPublicationReadinessAnalyzerClassificationLabel(
            analysis.publicationStatus
          )}
        </p>
        <p className="text-xs text-[var(--app-text-muted)] tabular-nums">
          Puntuación compuesta: {analysis.publicationScore.toFixed(1)} ·{" "}
          {analysis.evaluatedDomains} dominio
          {analysis.evaluatedDomains === 1 ? "" : "s"} evaluado
          {analysis.evaluatedDomains === 1 ? "" : "s"}
        </p>
      </div>

      <div className={`${contentPanel} mb-3 text-xs text-[var(--app-text-muted)]`}>
        <p className="font-semibold text-[var(--app-heading)]">
          Apoyo compuesto a decisiones
        </p>
        <p className="mt-1">
          Cobertura: {analysis.disclosure.coverage.evaluated.length} evaluados,{" "}
          {analysis.disclosure.coverage.defaulted.length} predeterminados y{" "}
          {analysis.disclosure.coverage.notEvaluated.length} no evaluados.
        </p>
        <p className="mt-1">
          Factores:{" "}
          {analysis.disclosure.contributingFactors
            .map((factor) => factor.label)
            .join(", ") || "ninguno"}
          . Fallbacks:{" "}
          {analysis.disclosure.defaultsAndFallbacks.length > 0
            ? analysis.disclosure.defaultsAndFallbacks.join("; ")
            : "ninguno"}
          .
        </p>
        <p className="mt-1">
          No constituye validación independiente ni idoneidad para una revista.
          La revisión y autoridad científica permanecen en la persona
          investigadora.
        </p>
        <p className="mt-1 font-semibold">
          Contenido mixto generado: GENERATED hasta revisión y aprobación
          explícitas; no es automáticamente citable ni una afirmación autoral.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {kpiCards.map((card) => (
          <div
            key={card.key}
            className={`${contentPanel} flex flex-col gap-1 min-h-[5.5rem]`}
          >
            <p className="text-xs font-semibold text-[var(--app-text-muted)]">
              {card.icon} {card.title}
            </p>
            <p className="text-lg font-semibold text-[var(--app-heading)] tabular-nums break-words">
              {card.value}
            </p>
            {card.subtitle ? (
              <p className="text-xs text-[var(--app-text-muted)]">
                {card.subtitle}
              </p>
            ) : null}
          </div>
        ))}
      </div>

      {analysis.normalitySummary ? (
        <div className="mt-4">
          <p className="text-sm font-semibold text-[var(--app-heading)]">
            Normalidad integrada
          </p>
          <p className={`mt-1 text-sm ${emptyState}`}>
            {analysis.normalitySummary.globalHeadline}
          </p>
          <p className={`mt-1 text-sm ${emptyState}`}>
            {analysis.normalitySummary.seriesEvaluated} series: normales=
            {analysis.normalitySummary.normalCount}, no normales=
            {analysis.normalitySummary.nonNormalCount}, cuestionables=
            {analysis.normalitySummary.questionableCount}, contradictorias=
            {analysis.normalitySummary.contradictoryCount}.
          </p>
        </div>
      ) : null}

      {analysis.multivariateHighlights ? (
        <div className="mt-4">
          <p className="text-sm font-semibold text-[var(--app-heading)]">
            Highlights multivariantes
          </p>
          {analysis.multivariateHighlights.pcaVariance !== undefined ? (
            <p className={`mt-1 text-sm ${emptyState}`}>
              PCA:{" "}
              {formatPCAVariancePercent(analysis.multivariateHighlights.pcaVariance)}{" "}
              varianza acumulada.
            </p>
          ) : null}
          {analysis.multivariateHighlights.clusterCount !== undefined ? (
            <p className={`mt-1 text-sm ${emptyState}`}>
              Clustering: {analysis.multivariateHighlights.clusterCount} grupos.
            </p>
          ) : null}
          {analysis.multivariateHighlights.topVariable ? (
            <p className={`mt-1 text-sm ${emptyState}`}>
              Variable líder:{" "}
              {analysis.multivariateHighlights.topVariableTied &&
              analysis.multivariateHighlights.topVariableTied.length > 1
                ? formatVariableImportanceCoLeaders(
                    analysis.multivariateHighlights.topVariableTied
                  )
                : analysis.multivariateHighlights.topVariable}
              .
            </p>
          ) : null}
          {analysis.multivariateHighlights.headline ? (
            <p className={`mt-1 text-sm ${emptyState}`}>
              {analysis.multivariateHighlights.headline}
            </p>
          ) : null}
        </div>
      ) : null}

      {analysis.inferentialHighlight?.prospectiveSampleSize !== null &&
      analysis.inferentialHighlight?.prospectiveSampleSize !== undefined &&
      analysis.inferentialHighlight.currentSampleSize !== null &&
      analysis.inferentialHighlight.currentSampleSize !== undefined ? (
        <div className="mt-4">
          <p className="text-sm font-semibold text-[var(--app-heading)]">
            Potencia prospectiva
          </p>
          <p className={`mt-1 text-sm ${emptyState}`}>
            n recomendado = {analysis.inferentialHighlight.prospectiveSampleSize};
            n actual = {analysis.inferentialHighlight.currentSampleSize}.
          </p>
          {analysis.inferentialHighlight.insufficientSampleWarning ? (
            <p className={`mt-1 text-sm ${emptyState}`}>
              ⚠ {analysis.inferentialHighlight.insufficientSampleWarning}
            </p>
          ) : null}
        </div>
      ) : null}

      {analysis.crossDomainDiagnosis.length > 0 ? (
        <div className="mt-4">
          <p className="text-sm font-semibold text-[var(--app-heading)]">
            Diagnóstico compuesto
          </p>
          <ul className="mt-2 space-y-1">
            {analysis.crossDomainDiagnosis.map((line, index) => (
              <li
                key={`publication-dashboard-diagnosis-${index}`}
                className={`text-sm ${emptyState}`}
              >
                • {line}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {analysis.publicationRisks.length > 0 ? (
        <div className="mt-4">
          <p className="text-sm font-semibold text-[var(--app-heading)]">
            Riesgos para revisión
          </p>
          <ul className="mt-2 space-y-1">
            {analysis.publicationRisks.map((line, index) => (
              <li
                key={`publication-dashboard-risk-${index}`}
                className={`text-sm ${emptyState}`}
              >
                ⚠ {line}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {analysis.publicationRecommendations.length > 0 ? (
        <div className="mt-4">
          <p className="text-sm font-semibold text-[var(--app-heading)]">
            Sugerencias para revisión
          </p>
          <ul className="mt-2 space-y-1">
            {analysis.publicationRecommendations.map((line, index) => (
              <li
                key={`publication-dashboard-recommendation-${index}`}
                className={`text-sm ${emptyState}`}
              >
                • {line}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
