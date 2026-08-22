import type { ScientificArtifactKind } from "./artifacts";

export type ScientificResultContractId =
  | "descriptive.series-statistics"
  | "distribution.exploration"
  | "inference.parametric"
  | "inference.nonparametric"
  | "sci-57.effect-size-power"
  | "ge.pca"
  | "vgb.pca"
  | "sci-58.comparison"
  | "sci-50.consistency"
  | "sci-51.report-quality"
  | "sci-52.reproducibility"
  | "sci-53.evidence-strength"
  | "sci-54.assumptions"
  | "sci-55.publication-readiness"
  | "sci-56.methodological-dashboard"
  | "sci-59.guided-workflow"
  | "sci-60.publication-dashboard"
  | "vgb.preview-values";

export type ScientificSemanticFieldDescriptor = {
  name: string;
  meaning: string;
  unit?: string;
};

export type ScientificApproximationPolicy = {
  mode:
    | "exact-formula"
    | "numerical"
    | "asymptotic"
    | "heuristic"
    | "mixed"
    | "not-applicable";
  statement: string;
};

export type ScientificPersistencePolicy = {
  mode:
    | "runtime-only"
    | "snapshot-only"
    | "project-session-state"
    | "configuration-only";
  statement: string;
};

export type ScientificResultContractDescriptor = {
  id: ScientificResultContractId;
  sciId?: `SCI-${number}`;
  family:
    | "descriptive-distribution"
    | "inference"
    | "effect-size-power"
    | "pca"
    | "comparison"
    | "methodology"
    | "workflow"
    | "visual-graph-builder";
  contractRole:
    | "result"
    | "aggregate-result"
    | "workflow-state"
    | "preview-values";
  artifactKind: ScientificArtifactKind;
  ownerPaths: readonly string[];
  ownerTypes: readonly string[];
  semanticFields: readonly ScientificSemanticFieldDescriptor[];
  approximationPolicy: ScientificApproximationPolicy;
  persistencePolicy: ScientificPersistencePolicy;
};

const field = (
  name: string,
  meaning: string,
  unit?: string
): ScientificSemanticFieldDescriptor => ({ name, meaning, unit });

const runtimeOnly = (statement: string): ScientificPersistencePolicy => ({
  mode: "runtime-only",
  statement,
});

/**
 * Authoritative inventory of result-shaped scientific contracts. This is
 * metadata about federated owners, not a shared result payload or ResultModel.
 */
export const SCIENTIFIC_RESULT_CONTRACT_INVENTORY = [
  {
    id: "descriptive.series-statistics",
    family: "descriptive-distribution",
    contractRole: "result",
    artifactKind: "scientific-result",
    ownerPaths: [
      "src/lib/graph/series/types.ts",
      "src/lib/graph/series/transforms.ts",
    ],
    ownerTypes: ["ExperimentalStatistics"],
    semanticFields: [
      field("seriesId, seriesName", "Identidad y etiqueta de la serie."),
      field("count", "Cantidad de observaciones finitas.", "observaciones"),
      field("meanX, meanY, medianY", "Medidas de localización."),
      field("minY, maxY, rangeY", "Extremos y amplitud observada."),
      field("varianceY, stdDevY", "Dispersión muestral."),
      field(
        "coefficientOfVariation",
        "Variación relativa; null cuando no es definible."
      ),
    ],
    approximationPolicy: {
      mode: "exact-formula",
      statement: "Estadísticos deterministas sobre los puntos retenidos.",
    },
    persistencePolicy: runtimeOnly(
      "Los estadísticos se recalculan; no son un registro persistido."
    ),
  },
  {
    id: "distribution.exploration",
    family: "descriptive-distribution",
    contractRole: "result",
    artifactKind: "scientific-result",
    ownerPaths: [
      "src/app/page.tsx",
      "src/lib/scientific/normality/types.ts",
    ],
    ownerTypes: [
      "SeriesHistogram",
      "BoxPlotAnalysis",
      "ViolinPlotAnalysis",
      "KernelDensityAnalysis",
      "CanonicalNormalityAssessment",
      "QQPlotAnalysis",
    ],
    semanticFields: [
      field("bins", "Intervalos y conteos del histograma."),
      field(
        "quartiles, whiskers, outliers",
        "Resumen IQR y observaciones fuera de cercas."
      ),
      field("densityPoints, bandwidth", "Estimación de densidad kernel."),
      field(
        "classification, confidence, warnings",
        "Conclusión de normalidad, confianza y advertencias."
      ),
      field(
        "correlation, theoretical/sample points",
        "Ajuste y coordenadas del gráfico Q-Q."
      ),
    ],
    approximationPolicy: {
      mode: "mixed",
      statement:
        "Cuantiles e histograma son deterministas; KDE, forma y normalidad son estimaciones o reglas de umbral.",
    },
    persistencePolicy: runtimeOnly(
      "Las distribuciones y conclusiones se derivan en vivo de las series."
    ),
  },
  {
    id: "inference.parametric",
    family: "inference",
    contractRole: "result",
    artifactKind: "scientific-result",
    ownerPaths: [
      "src/lib/scientific/inference/types.ts",
      "src/lib/scientific/inference/parametric.ts",
    ],
    ownerTypes: [
      "TTestResult",
      "AnovaResult",
      "AnovaAnalysis",
      "PostHocComparison",
    ],
    semanticFields: [
      field(
        "sample sizes, means, standard deviations",
        "Resúmenes de grupos analizados."
      ),
      field(
        "tStatistic, fStatistic, qStatistic",
        "Estadísticos de contraste."
      ),
      field("degreesOfFreedom", "Grados de libertad del contraste."),
      field("pValue, significant", "Probabilidad calculada y decisión por alfa."),
      field(
        "sum/mean squares",
        "Descomposición de variación para ANOVA."
      ),
    ],
    approximationPolicy: {
      mode: "numerical",
      statement:
        "Estadísticos por fórmula; probabilidades dependen de aproximaciones numéricas de distribución.",
    },
    persistencePolicy: runtimeOnly(
      "Los resultados inferenciales no se persisten como entidades."
    ),
  },
  {
    id: "inference.nonparametric",
    family: "inference",
    contractRole: "result",
    artifactKind: "scientific-result",
    ownerPaths: [
      "src/lib/scientific/inference/types.ts",
      "src/lib/scientific/inference/nonparametric.ts",
    ],
    ownerTypes: [
      "MannWhitneyResult",
      "KruskalWallisResult",
      "PooledRankEntry",
    ],
    semanticFields: [
      field("sample/group counts", "Tamaños de muestra y cantidad de grupos."),
      field("uStatistic, hStatistic", "Estadísticos basados en rangos."),
      field("zScore", "Normalización del estadístico U."),
      field("degreesOfFreedom", "Grados de libertad de Kruskal-Wallis."),
      field("pValue, significant", "Probabilidad aproximada y decisión."),
    ],
    approximationPolicy: {
      mode: "asymptotic",
      statement:
        "Rangos por fórmula y valores p mediante aproximaciones asintóticas.",
    },
    persistencePolicy: runtimeOnly(
      "Los resultados no paramétricos son derivados de sesión."
    ),
  },
  {
    id: "sci-57.effect-size-power",
    sciId: "SCI-57",
    family: "effect-size-power",
    contractRole: "result",
    artifactKind: "scientific-result",
    ownerPaths: [
      "src/lib/scientific/inference/types.ts",
      "src/lib/scientific/inference/effect-size.ts",
    ],
    ownerTypes: ["EffectSizeEntry", "EffectSizePowerAnalysis"],
    semanticFields: [
      field(
        "entries",
        "Fuente, comparación, métrica, valor, intervalo y magnitud."
      ),
      field(
        "dominantMagnitude, dominantEntry",
        "Síntesis del efecto dominante."
      ),
      field(
        "prospectiveSampleSize, currentSampleSize",
        "Tamaño recomendado y tamaño disponible."
      ),
      field("observedPower", "Potencia observada cuando está disponible."),
      field(
        "powerDisclaimer, insufficientSampleWarning, interpretation",
        "Límites y lectura del resultado."
      ),
    ],
    approximationPolicy: {
      mode: "mixed",
      statement:
        "Efectos por fórmula; intervalos, potencia y tamaño prospectivo pueden usar aproximaciones.",
    },
    persistencePolicy: runtimeOnly(
      "SCI-57 se recalcula; perfiles de comparación solo pueden capturar un resumen."
    ),
  },
  {
    id: "ge.pca",
    family: "pca",
    contractRole: "result",
    artifactKind: "scientific-result",
    ownerPaths: ["src/app/page.tsx"],
    ownerTypes: ["PCAAnalysis", "PCAResultPoint", "PCALoading"],
    semanticFields: [
      field(
        "component1Variance, component2Variance, cumulativeVariance",
        "Varianza explicada.",
        "%"
      ),
      field("points", "Scores PC1/PC2 por índice de observación."),
      field(
        "loadings",
        "Cargas y contribución porcentual por variable y componente."
      ),
      field(
        "interpretation, loadingsInterpretation",
        "Mensajes derivados de umbrales."
      ),
    ],
    approximationPolicy: {
      mode: "numerical",
      statement:
        "Dos componentes estimados por power iteration con máximo de 200 iteraciones.",
    },
    persistencePolicy: runtimeOnly(
      "El PCA de GE es un resultado derivado en vivo."
    ),
  },
  {
    id: "vgb.pca",
    family: "pca",
    contractRole: "result",
    artifactKind: "scientific-result",
    ownerPaths: ["src/lib/visualGraphBuilder.ts"],
    ownerTypes: [
      "PCAWorksheetAnalysis",
      "VisualGraphPreviewPcaPoint",
      "VisualGraphPreviewPcaMeta",
    ],
    semanticFields: [
      field("pcaData", "Scores PC1/PC2 de filas completas."),
      field(
        "pcaMeta.component1Variance",
        "Varianza explicada por PC1.",
        "%"
      ),
      field(
        "pcaMeta.component2Variance",
        "Varianza explicada por PC2.",
        "%"
      ),
      field("pcaMeta.cumulativeVariance", "Varianza acumulada.", "%"),
    ],
    approximationPolicy: {
      mode: "numerical",
      statement:
        "Dos componentes por power iteration; signo canónico por primera carga no nula.",
    },
    persistencePolicy: {
      mode: "configuration-only",
      statement:
        "Se puede persistir la especificación VGB; pcaData y pcaMeta se recalculan.",
    },
  },
  {
    id: "sci-58.comparison",
    sciId: "SCI-58",
    family: "comparison",
    contractRole: "aggregate-result",
    artifactKind: "comparison-snapshot",
    ownerPaths: [
      "src/lib/scientific/comparison/types.ts",
      "src/lib/scientific/comparison/analysis.ts",
    ],
    ownerTypes: ["DatasetAnalysisProfile", "MultiDatasetComparisonAnalysis"],
    semanticFields: [
      field("slotA, slotB", "Perfiles capturados que se comparan."),
      field(
        "kpiRows",
        "Valores A/B, delta y dirección por indicador comparable."
      ),
      field(
        "comparabilityWarnings",
        "Advertencias sobre límites de comparabilidad."
      ),
      field(
        "crossDatasetDiagnosis, comparisonRecommendations",
        "Síntesis y recomendaciones."
      ),
      field(
        "evaluatedMetrics, availability flags",
        "Cobertura efectiva de la comparación."
      ),
    ],
    approximationPolicy: {
      mode: "mixed",
      statement:
        "Deltas son exactos respecto de snapshots; diagnósticos y clasificaciones usan reglas.",
    },
    persistencePolicy: {
      mode: "snapshot-only",
      statement:
        "Solo se persisten perfiles KPI SCI-58 compatibles; no el análisis completo ni series.",
    },
  },
  {
    id: "sci-50.consistency",
    sciId: "SCI-50",
    family: "methodology",
    contractRole: "result",
    artifactKind: "scientific-result",
    ownerPaths: [
      "src/lib/scientific/methodology/consistency/types.ts",
      "src/lib/scientific/methodology/consistency/build.ts",
      "src/lib/scientific/methodology/disclosure.ts",
    ],
    ownerTypes: ["ConsistencyEngineAnalysis"],
    semanticFields: [
      field("consistencyScore", "Puntuación compuesta de consistencia.", "0–100"),
      field("classification", "Clase por umbrales."),
      field("evidenceCount, supportingModules", "Cobertura de señales."),
      field("interpretation", "Explicaciones derivadas."),
      field("disclosure", "Cobertura, procedencia, fallbacks y limitaciones."),
    ],
    approximationPolicy: {
      mode: "heuristic",
      statement: "Agregación reglada de señales disponibles; no es un estimador inferencial.",
    },
    persistencePolicy: runtimeOnly("SCI-50 se deriva en vivo."),
  },
  {
    id: "sci-51.report-quality",
    sciId: "SCI-51",
    family: "methodology",
    contractRole: "result",
    artifactKind: "scientific-result",
    ownerPaths: [
      "src/lib/scientific/methodology/report-quality/types.ts",
      "src/lib/scientific/methodology/report-quality/build.ts",
      "src/lib/scientific/methodology/disclosure.ts",
    ],
    ownerTypes: ["ReportQualityEngineAnalysis"],
    semanticFields: [
      field("qualityScore", "Puntuación compuesta de calidad.", "0–100"),
      field("classification", "Clase por umbrales."),
      field("evaluatedCriteria", "Cantidad de criterios evaluados."),
      field("interpretation", "Explicaciones derivadas."),
      field("disclosure", "Cobertura, procedencia, fallbacks y limitaciones."),
    ],
    approximationPolicy: {
      mode: "heuristic",
      statement: "Puntuación reglada de completitud y señales metodológicas.",
    },
    persistencePolicy: runtimeOnly("SCI-51 se deriva en vivo."),
  },
  {
    id: "sci-52.reproducibility",
    sciId: "SCI-52",
    family: "methodology",
    contractRole: "result",
    artifactKind: "scientific-result",
    ownerPaths: [
      "src/lib/scientific/methodology/reproducibility/types.ts",
      "src/lib/scientific/methodology/reproducibility/build.ts",
      "src/lib/scientific/methodology/disclosure.ts",
    ],
    ownerTypes: ["ReproducibilityExplorerAnalysis"],
    semanticFields: [
      field("reproducibilityScore", "Puntuación compuesta de reproducibilidad.", "0–100"),
      field("classification", "Clase por umbrales."),
      field("evaluatedFactors", "Cantidad de factores evaluados."),
      field("interpretation", "Explicaciones derivadas."),
      field("disclosure", "Cobertura, procedencia, fallbacks y limitaciones."),
    ],
    approximationPolicy: {
      mode: "heuristic",
      statement: "Indicador reglado; no replica el experimento ni mide reproducibilidad externa.",
    },
    persistencePolicy: runtimeOnly("SCI-52 se deriva en vivo."),
  },
  {
    id: "sci-53.evidence-strength",
    sciId: "SCI-53",
    family: "methodology",
    contractRole: "result",
    artifactKind: "scientific-result",
    ownerPaths: [
      "src/lib/scientific/methodology/evidence/types.ts",
      "src/lib/scientific/methodology/evidence/build.ts",
      "src/lib/scientific/methodology/disclosure.ts",
    ],
    ownerTypes: ["EvidenceStrengthEngineAnalysis"],
    semanticFields: [
      field("evidenceScore", "Puntuación compuesta de evidencia.", "0–100"),
      field("classification", "Clase por umbrales."),
      field("evidenceSources", "Cantidad de fuentes internas evaluadas."),
      field("interpretation", "Explicaciones derivadas."),
      field("disclosure", "Cobertura, procedencia, fallbacks y limitaciones."),
    ],
    approximationPolicy: {
      mode: "heuristic",
      statement: "Síntesis reglada de resultados internos disponibles.",
    },
    persistencePolicy: runtimeOnly("SCI-53 se deriva en vivo."),
  },
  {
    id: "sci-54.assumptions",
    sciId: "SCI-54",
    family: "methodology",
    contractRole: "result",
    artifactKind: "scientific-result",
    ownerPaths: [
      "src/lib/scientific/methodology/assumptions/types.ts",
      "src/lib/scientific/methodology/assumptions/build.ts",
      "src/lib/scientific/methodology/disclosure.ts",
    ],
    ownerTypes: ["AssumptionTrackerAnalysis", "AssumptionTrackerItem"],
    semanticFields: [
      field("overallScore", "Puntuación agregada de supuestos.", "0–100"),
      field("classification", "Clase por umbrales."),
      field("assumptions", "Nombre, estado y fuente de cada supuesto."),
      field("interpretation", "Explicaciones derivadas."),
      field("disclosure", "Cobertura, procedencia, fallbacks y limitaciones."),
    ],
    approximationPolicy: {
      mode: "heuristic",
      statement: "Estados y puntuación provienen de reglas sobre diagnósticos disponibles.",
    },
    persistencePolicy: runtimeOnly("SCI-54 se deriva en vivo."),
  },
  {
    id: "sci-55.publication-readiness",
    sciId: "SCI-55",
    family: "methodology",
    contractRole: "result",
    artifactKind: "scientific-result",
    ownerPaths: [
      "src/lib/scientific/methodology/readiness/types.ts",
      "src/lib/scientific/methodology/readiness/build.ts",
      "src/lib/scientific/methodology/disclosure.ts",
    ],
    ownerTypes: ["PublicationReadinessAnalyzerAnalysis"],
    semanticFields: [
      field("readinessScore", "Puntuación de preparación.", "0–100"),
      field("classification", "Estado editorial por umbrales."),
      field("evaluatedAreas", "Cantidad de áreas evaluadas."),
      field("interpretation", "Explicaciones derivadas."),
      field("disclosure", "Cobertura, procedencia, fallbacks y limitaciones."),
    ],
    approximationPolicy: {
      mode: "heuristic",
      statement: "Síntesis reglada; no sustituye revisión editorial o por pares.",
    },
    persistencePolicy: runtimeOnly(
      "SCI-55 se recalcula; comparaciones pueden capturar su KPI."
    ),
  },
  {
    id: "sci-56.methodological-dashboard",
    sciId: "SCI-56",
    family: "methodology",
    contractRole: "aggregate-result",
    artifactKind: "aggregate-result",
    ownerPaths: [
      "src/lib/scientific/methodology/summary/types.ts",
      "src/lib/scientific/methodology/summary/build.ts",
      "src/lib/scientific/methodology/disclosure.ts",
    ],
    ownerTypes: ["MethodologicalDashboardAnalysis"],
    semanticFields: [
      field("summaryCards", "Scores y clasificaciones SCI-50 a SCI-55 disponibles."),
      field("overallHealthScore", "Salud metodológica agregada.", "0–100"),
      field("evaluatedEngines", "Cantidad de motores incluidos."),
      field("diagnosis", "Diagnóstico derivado."),
      field("disclosure", "Cobertura, procedencia, fallbacks y limitaciones."),
    ],
    approximationPolicy: {
      mode: "heuristic",
      statement: "Agregación reglada de motores metodológicos heterogéneos.",
    },
    persistencePolicy: runtimeOnly(
      "SCI-56 se deriva; perfiles SCI-58 pueden capturar un resumen."
    ),
  },
  {
    id: "sci-59.guided-workflow",
    sciId: "SCI-59",
    family: "workflow",
    contractRole: "workflow-state",
    artifactKind: "workflow-state",
    ownerPaths: [
      "src/lib/scientific/workflow/types.ts",
      "src/lib/scientific/workflow/plan.ts",
    ],
    ownerTypes: ["GuidedWorkflowPlan", "GuidedWorkflowSession"],
    semanticFields: [
      field("templateId, steps", "Plan de navegación y módulos sugeridos."),
      field("status, currentStepIndex", "Estado y posición de la sesión."),
      field("completedStepIds, skippedStepIds", "Progreso explícito."),
      field("startedAt, completedAt", "Marcas temporales de la sesión."),
    ],
    approximationPolicy: {
      mode: "not-applicable",
      statement: "SCI-59 coordina flujo; no es un resultado científico.",
    },
    persistencePolicy: {
      mode: "project-session-state",
      statement:
        "Solo el estado de sesión previsto por el proyecto puede persistir; no crea resultado citable.",
    },
  },
  {
    id: "sci-60.publication-dashboard",
    sciId: "SCI-60",
    family: "methodology",
    contractRole: "aggregate-result",
    artifactKind: "aggregate-result",
    ownerPaths: [
      "src/lib/scientific/methodology/publication/types.ts",
      "src/lib/scientific/methodology/publication/build.ts",
      "src/lib/scientific/methodology/disclosure.ts",
    ],
    ownerTypes: ["PublicationDashboardAnalysis"],
    semanticFields: [
      field("publicationStatus, publicationScore", "Síntesis SCI-55."),
      field(
        "methodologicalHealthScore, evidenceScore, evidenceClassification",
        "Indicadores metodológicos."
      ),
      field(
        "normalitySummary, multivariateHighlights, inferentialHighlight",
        "Resúmenes cross-domain."
      ),
      field("recommendedTest, advisorConfidence", "Recomendación y confianza."),
      field(
        "crossDomainDiagnosis, publicationRisks, publicationRecommendations",
        "Síntesis editorial."
      ),
      field("evaluatedDomains", "Cantidad de dominios incluidos."),
      field("disclosure", "Cobertura, procedencia, fallbacks y limitaciones."),
    ],
    approximationPolicy: {
      mode: "heuristic",
      statement: "Dashboard reglado que agrega resultados con aproximaciones propias.",
    },
    persistencePolicy: runtimeOnly(
      "SCI-60 se deriva en vivo; no se persiste el agregado completo."
    ),
  },
  {
    id: "vgb.preview-values",
    family: "visual-graph-builder",
    contractRole: "preview-values",
    artifactKind: "preview-values",
    ownerPaths: ["src/lib/visualGraphBuilder.ts"],
    ownerTypes: [
      "VisualGraphPreview",
      "VisualGraphPreviewPoint",
      "VisualGraphPreviewLineSeries",
      "VisualGraphPreviewBarItem",
      "VisualGraphPreviewHistogramBin",
      "VisualGraphPreviewBoxPlotItem",
      "VisualGraphPreviewViolinItem",
      "VisualGraphPreviewHeatmapCell",
      "VisualGraphPreviewBubblePoint",
      "VisualGraphPreviewPcaPoint",
      "VisualGraphPreviewPcaMeta",
    ],
    semanticFields: [
      field("graphType, title, xLabel, yLabel", "Identidad visual del preview."),
      field(
        "scatterPoints, lineSeries, barData",
        "Valores derivados para gráficos cartesianos."
      ),
      field(
        "histogramBins, boxPlotData, violinData",
        "Valores derivados de distribución."
      ),
      field(
        "heatmapData, bubbleData",
        "Celdas de correlación y puntos de burbuja."
      ),
      field("pcaData, pcaMeta", "Scores y varianza PCA del preview."),
    ],
    approximationPolicy: {
      mode: "mixed",
      statement: "Cada familia conserva la aproximación de su builder especializado.",
    },
    persistencePolicy: {
      mode: "configuration-only",
      statement:
        "Los valores de preview no se persisten; solo la especificación autorizada se materializa.",
    },
  },
] as const satisfies readonly ScientificResultContractDescriptor[];

export const getScientificResultContract = (
  id: ScientificResultContractId
): ScientificResultContractDescriptor => {
  const descriptor = SCIENTIFIC_RESULT_CONTRACT_INVENTORY.find(
    (candidate) => candidate.id === id
  );
  if (!descriptor) {
    throw new Error(`Unknown scientific result contract: ${id}`);
  }
  return descriptor;
};

export const listScientificContractsBySciId = (
  sciId: `SCI-${number}`
): readonly ScientificResultContractDescriptor[] =>
  SCIENTIFIC_RESULT_CONTRACT_INVENTORY.filter(
    (descriptor) => "sciId" in descriptor && descriptor.sciId === sciId
  );
