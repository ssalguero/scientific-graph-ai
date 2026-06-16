import type {
  CanonicalNormalityKernelInput,
  CanonicalNormalityNormalityInput,
  CanonicalNormalityQQInput,
  CanonicalNormalityViolinInput,
} from "./input-types";
import { buildCanonicalNormalitySourceSummary } from "./source-summary";
import {
  isDistributionShapeFavorable,
  isDistributionShapeUnfavorable,
  isKernelShapeSkewed,
  isNormalityClassificationFavorable,
  isQQInterpretationFavorable,
  isQQInterpretationUnfavorable,
  isViolinShapeSkewed,
} from "./rules";
import type { CanonicalNormalityAssessment, NormalityConsensus } from "./types";

const buildCanonicalNormalityAssessmentForSeries = (
  normality: CanonicalNormalityNormalityInput | undefined,
  qqPlot: CanonicalNormalityQQInput | undefined,
  violinPlot: CanonicalNormalityViolinInput | undefined,
  kernelDensity: CanonicalNormalityKernelInput | undefined
): NormalityConsensus => {
  const seriesName =
    normality?.seriesName ??
    qqPlot?.seriesName ??
    violinPlot?.seriesName ??
    kernelDensity?.seriesName ??
    "Serie";

  const sourceSummary = buildCanonicalNormalitySourceSummary(
    normality,
    qqPlot,
    violinPlot,
    kernelDensity
  );

  if (!normality || normality.classification === null) {
    return {
      seriesName,
      conclusion: "questionable",
      confidence: "low",
      reasons: [
        "Datos insuficientes para evaluar normalidad.",
        ...sourceSummary,
      ],
      sourceSummary,
    };
  }

  if (normality.classification === "non-normal") {
    return {
      seriesName,
      conclusion: "non-normal",
      confidence: "high",
      reasons: [
        "SCI-11 clasifica la serie como no normal.",
        ...sourceSummary.filter((reason) => !reason.startsWith("SCI-11:")),
      ],
      sourceSummary,
    };
  }

  const normalityFavorable = isNormalityClassificationFavorable(
    normality.classification
  );
  const qqUnfavorable = isQQInterpretationUnfavorable(qqPlot?.interpretation);
  const qqFavorable = isQQInterpretationFavorable(qqPlot?.interpretation);
  const violinUnfavorable = violinPlot
    ? !isDistributionShapeFavorable(violinPlot.shapeInterpretation)
    : false;
  const kernelUnfavorable = kernelDensity
    ? isDistributionShapeUnfavorable(kernelDensity.distributionShape)
    : false;
  const visualUnfavorable = violinUnfavorable || kernelUnfavorable;
  const visualFavorable =
    (!violinPlot ||
      isDistributionShapeFavorable(violinPlot.shapeInterpretation)) &&
    (!kernelDensity ||
      isDistributionShapeFavorable(kernelDensity.distributionShape));

  if (normalityFavorable && (qqUnfavorable || visualUnfavorable)) {
    return {
      seriesName,
      conclusion: "contradictory",
      confidence: "medium",
      reasons: [
        "SCI-11 indica compatibilidad con normalidad, pero el Q-Q Plot, Violin Plot o KDE evidencian desviaciones. Interprete con cautela y considere métodos no paramétricos.",
        ...sourceSummary,
      ],
      sourceSummary,
    };
  }

  if (
    normality.classification === "normal" &&
    qqFavorable &&
    visualFavorable
  ) {
    return {
      seriesName,
      conclusion: "normal",
      confidence: "high",
      reasons: [
        "SCI-11, Q-Q Plot, Violin Plot y KDE son coherentes con normalidad.",
        ...sourceSummary,
      ],
      sourceSummary,
    };
  }

  const qqModerate = qqPlot?.interpretation === "moderate";
  const violinSkewed = isViolinShapeSkewed(violinPlot?.shapeInterpretation);
  const kdeSkewed = isKernelShapeSkewed(kernelDensity?.distributionShape);

  if (normalityFavorable && (qqModerate || violinSkewed || kdeSkewed)) {
    const reasons = [
      "SCI-11 indica compatibilidad con normalidad, pero al menos un diagnóstico complementario muestra reservas.",
    ];
    if (qqModerate) reasons.push("Q-Q Plot con ajuste moderado.");
    if (violinSkewed) reasons.push("Violin Plot con asimetría.");
    if (kdeSkewed) reasons.push("KDE con asimetría.");
    reasons.push(...sourceSummary);
    return {
      seriesName,
      conclusion: "probably-normal",
      confidence: "medium",
      reasons,
      sourceSummary,
    };
  }

  if (qqUnfavorable || kernelUnfavorable) {
    return {
      seriesName,
      conclusion: "non-normal",
      confidence: "high",
      reasons: [
        "Los indicadores disponibles no respaldan el supuesto de normalidad para esta serie.",
        ...sourceSummary,
      ],
      sourceSummary,
    };
  }

  return {
    seriesName,
    conclusion: "questionable",
    confidence: sourceSummary.length >= 2 ? "medium" : "low",
    reasons: [
      "No se alcanzó un consenso claro de normalidad con los indicadores disponibles.",
      ...sourceSummary,
    ],
    sourceSummary,
  };
};

export const buildCanonicalNormalityAssessment = (
  normalityAnalyses: CanonicalNormalityNormalityInput[],
  qqPlotAnalyses: CanonicalNormalityQQInput[],
  violinPlotAnalyses: CanonicalNormalityViolinInput[],
  kernelDensityAnalyses: CanonicalNormalityKernelInput[]
): CanonicalNormalityAssessment => {
  const seriesNames = new Set<string>();
  normalityAnalyses.forEach((analysis) => seriesNames.add(analysis.seriesName));
  qqPlotAnalyses.forEach((analysis) => seriesNames.add(analysis.seriesName));
  violinPlotAnalyses.forEach((analysis) => seriesNames.add(analysis.seriesName));
  kernelDensityAnalyses.forEach((analysis) =>
    seriesNames.add(analysis.seriesName)
  );

  if (seriesNames.size === 0) {
    return {
      seriesAssessments: [],
      globalConclusion: [
        "No hay series disponibles para evaluación integrada de normalidad.",
      ],
      warnings: [],
    };
  }

  const normalityByName = new Map(
    normalityAnalyses.map((analysis) => [analysis.seriesName, analysis])
  );
  const qqByName = new Map(
    qqPlotAnalyses.map((analysis) => [analysis.seriesName, analysis])
  );
  const violinByName = new Map(
    violinPlotAnalyses.map((analysis) => [analysis.seriesName, analysis])
  );
  const kdeByName = new Map(
    kernelDensityAnalyses.map((analysis) => [analysis.seriesName, analysis])
  );

  const seriesAssessments = Array.from(seriesNames).map((seriesName) =>
    buildCanonicalNormalityAssessmentForSeries(
      normalityByName.get(seriesName),
      qqByName.get(seriesName),
      violinByName.get(seriesName),
      kdeByName.get(seriesName)
    )
  );

  const contradictoryCount = seriesAssessments.filter(
    (assessment) => assessment.conclusion === "contradictory"
  ).length;
  const normalCount = seriesAssessments.filter(
    (assessment) => assessment.conclusion === "normal"
  ).length;
  const nonNormalCount = seriesAssessments.filter(
    (assessment) => assessment.conclusion === "non-normal"
  ).length;

  const globalConclusion: string[] = [];

  if (normalCount === seriesAssessments.length) {
    globalConclusion.push(
      "La evaluación integrada (SCI-11, SCI-21, SCI-22 y SCI-26) es coherente con normalidad en todas las series."
    );
  } else if (contradictoryCount > 0) {
    globalConclusion.push(
      `Se detectaron ${contradictoryCount} serie(s) con señales contradictorias entre normalidad estadística y diagnósticos visuales.`
    );
  } else if (nonNormalCount === seriesAssessments.length) {
    globalConclusion.push(
      "La evaluación integrada indica que ninguna serie cumple de forma consistente el supuesto de normalidad."
    );
  } else {
    globalConclusion.push(
      "La evaluación integrada muestra señales mixtas de normalidad entre series y métodos."
    );
  }

  const warnings: string[] = [];
  seriesAssessments
    .filter((assessment) => assessment.conclusion === "contradictory")
    .forEach((assessment) => {
      warnings.push(`"${assessment.seriesName}": ${assessment.reasons[0]}`);
    });

  return {
    seriesAssessments,
    globalConclusion,
    warnings,
  };
};
