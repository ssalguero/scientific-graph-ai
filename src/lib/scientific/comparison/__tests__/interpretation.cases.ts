import {
  buildComparabilityWarnings,
  buildCrossDatasetComparisonDiagnosis,
  buildCrossDatasetComparisonRecommendations,
} from "../interpretation";
import { buildComparisonKpiRow } from "../analysis";
import {
  buildCanonicalDataset5Profile,
  buildCanonicalDataset6Profile,
  buildEnrichedDataset5Profile,
  buildEnrichedDataset6Profile,
  buildIncompleteProfile,
} from "./fixtures/profiles";
import type { AssertCase } from "./run-assertions";

export const runInterpretationCases = (assertCase: AssertCase) => {
  const slotA = buildCanonicalDataset5Profile();
  const slotB = buildCanonicalDataset6Profile();

  const warningsMismatchSeries = buildComparabilityWarnings(
    { ...slotA, seriesCount: 3 },
    { ...slotB, seriesCount: 5 }
  );
  assertCase(
    "warnings.seriesCountMismatch",
    warningsMismatchSeries.some((line) =>
      line.includes("distinto número de series")
    )
  );

  const warningsSampleSize = buildComparabilityWarnings(
    { ...slotA, totalObservations: 100 },
    { ...slotB, totalObservations: 10 }
  );
  assertCase(
    "warnings.sampleSizeDisparity",
    warningsSampleSize.some((line) =>
      line.includes("tamaños muestrales son muy dispares")
    )
  );

  const warningsIncomplete = buildComparabilityWarnings(
    buildIncompleteProfile("A"),
    buildIncompleteProfile("B")
  );
  assertCase(
    "warnings.incompleteProfile",
    warningsIncomplete.some((line) =>
      line.includes("Capture ambos slots con motores SCI-50→57")
    )
  );

  const warningsInferentialAOnly = buildComparabilityWarnings(
    { ...slotA, inferential: { dominantMagnitude: "large", metric: "d" } },
    { ...slotB, inferential: undefined }
  );
  assertCase(
    "warnings.inferentialAOnly",
    warningsInferentialAOnly.some((line) =>
      line.includes("Effect size disponible solo en Slot A")
    )
  );

  const warningsMetricMismatch = buildComparabilityWarnings(
    {
      ...slotA,
      inferential: { metric: "Cohen's d" },
    },
    {
      ...slotB,
      inferential: { metric: "eta-squared" },
    }
  );
  assertCase(
    "warnings.inferentialMetricMismatch",
    warningsMetricMismatch.some((line) =>
      line.includes("no son directamente comparables")
    )
  );

  const readinessRow = buildComparisonKpiRow({
    key: "readiness",
    title: "Readiness (SCI-55)",
    slotAValue: "77.0 (Near Ready)",
    slotBValue: "67.5 (Requires Review)",
    slotANumeric: 77.0,
    slotBNumeric: 67.5,
    higherIsBetter: true,
  });
  const evidenceRow = buildComparisonKpiRow({
    key: "evidence",
    title: "Evidence (SCI-53)",
    slotAValue: "82.7 (Strong)",
    slotBValue: "73.3 (Strong)",
    slotANumeric: 82.7,
    slotBNumeric: 73.3,
    higherIsBetter: true,
  });
  const publicationRow = buildComparisonKpiRow({
    key: "publicationStatus",
    title: "Publication Status",
    slotAValue: "Near Ready",
    slotBValue: "Requires Review",
    higherIsBetter: false,
  });

  const diagnosis = buildCrossDatasetComparisonDiagnosis({
    slotA,
    slotB,
    kpiRows: [readinessRow, evidenceRow, publicationRow],
  });
  assertCase(
    "diagnosis.readinessRegression",
    diagnosis.some((line) =>
      line.includes("menor preparación metodológica")
    )
  );
  assertCase(
    "diagnosis.publicationDiverge",
    diagnosis.some((line) => line.includes("Publication Status diverge"))
  );

  const neutralKpiRows = [
    buildComparisonKpiRow({
      key: "readiness",
      title: "Readiness",
      slotAValue: "70.0",
      slotBValue: "70.0",
      slotANumeric: 70.0,
      slotBNumeric: 70.0,
    }),
  ];
  const diagnosisFallback = buildCrossDatasetComparisonDiagnosis({
    slotA: { ...slotA, inferential: undefined, normality: undefined },
    slotB: { ...slotB, inferential: undefined, normality: undefined },
    kpiRows: neutralKpiRows,
  });
  assertCase(
    "diagnosis.fallbackNeutral",
    diagnosisFallback.some((line) =>
      line.includes("no muestran divergencias críticas")
    )
  );

  const regressedReadiness = buildComparisonKpiRow({
    key: "readiness",
    title: "Readiness",
    slotAValue: "80",
    slotBValue: "70",
    slotANumeric: 80,
    slotBNumeric: 70,
    higherIsBetter: true,
  });
  const recommendationsRegressed =
    buildCrossDatasetComparisonRecommendations({
      kpiRows: [regressedReadiness],
      comparabilityWarnings: [],
    });
  assertCase(
    "recommendations.regressed",
    recommendationsRegressed.some((line) =>
      line.includes("Revise supuestos y calidad metodológica en Slot B")
    )
  );

  const stableEvidence = buildComparisonKpiRow({
    key: "evidence",
    title: "Evidence",
    slotAValue: "80",
    slotBValue: "80",
    slotANumeric: 80,
    slotBNumeric: 80,
    higherIsBetter: true,
  });
  const regressedHealth = buildComparisonKpiRow({
    key: "overallHealth",
    title: "Health",
    slotAValue: "80",
    slotBValue: "70",
    slotANumeric: 80,
    slotBNumeric: 70,
    higherIsBetter: true,
  });
  const recommendationsStableEvidence =
    buildCrossDatasetComparisonRecommendations({
      kpiRows: [stableEvidence, regressedHealth],
      comparabilityWarnings: [],
    });
  assertCase(
    "recommendations.stableEvidenceRegressedHealth",
    recommendationsStableEvidence.some((line) =>
      line.includes("Priorice Assumptions y Reproducibility en Slot B")
    )
  );

  const recommendationsWithWarnings =
    buildCrossDatasetComparisonRecommendations({
      kpiRows: [stableEvidence],
      comparabilityWarnings: ["Advertencia de prueba"],
    });
  assertCase(
    "recommendations.comparabilityWarnings",
    recommendationsWithWarnings.some((line) =>
      line.includes("advertencias de comparabilidad")
    )
  );

  const recommendationsDefault = buildCrossDatasetComparisonRecommendations({
    kpiRows: [
      buildComparisonKpiRow({
        key: "readiness",
        title: "Readiness",
        slotAValue: "70",
        slotBValue: "70.2",
        slotANumeric: 70,
        slotBNumeric: 70.2,
        higherIsBetter: true,
      }),
    ],
    comparabilityWarnings: [],
  });
  assertCase(
    "recommendations.default",
    recommendationsDefault.some((line) =>
      line.includes("Documente el contraste entre slots")
    )
  );

  const enrichedA = buildEnrichedDataset5Profile();
  const enrichedB = buildEnrichedDataset6Profile();
  const warningsEngineMismatch = buildComparabilityWarnings(
    { ...enrichedA, methodological: { ...enrichedA.methodological!, evaluatedEngines: 6 } },
    { ...enrichedB, methodological: { ...enrichedB.methodological!, evaluatedEngines: 3 } }
  );
  assertCase(
    "warnings.methodologicalEngineMismatch",
    warningsEngineMismatch.some((line) =>
      line.includes("distinto número de motores SCI-50→55")
    )
  );

  const warningsMultivariateOnlyA = buildComparabilityWarnings(
    enrichedA,
    { ...enrichedB, multivariate: undefined }
  );
  assertCase(
    "warnings.multivariateAsymmetric",
    warningsMultivariateOnlyA.some((line) =>
      line.includes("Highlights multivariantes (SCI-40)")
    )
  );

  const recommendationsComplete =
    buildCrossDatasetComparisonRecommendations({
      kpiRows: [
        buildComparisonKpiRow({
          key: "readiness",
          title: "Readiness",
          slotAValue: "70",
          slotBValue: "70.2",
          slotANumeric: 70,
          slotBNumeric: 70.2,
          higherIsBetter: true,
        }),
      ],
      comparabilityWarnings: [],
      slotAComplete: true,
      slotBComplete: true,
    });
  assertCase(
    "recommendations.completeSlotsPdf",
    recommendationsComplete.some((line) =>
      line.includes("sección Multi-Dataset")
    )
  );

  const enrichedDiagnosis = buildCrossDatasetComparisonDiagnosis({
    slotA: enrichedA,
    slotB: enrichedB,
    kpiRows: [
      buildComparisonKpiRow({
        key: "overallHealth",
        title: "Health",
        slotAValue: "77",
        slotBValue: "67.5",
        slotANumeric: 77,
        slotBNumeric: 67.5,
        higherIsBetter: true,
      }),
      buildComparisonKpiRow({
        key: "assumption",
        title: "Assumptions",
        slotAValue: "75",
        slotBValue: "58",
        slotANumeric: 75,
        slotBNumeric: 58,
        higherIsBetter: true,
      }),
    ],
  });
  assertCase(
    "diagnosis.methodologicalSpread",
    enrichedDiagnosis.some((line) =>
      line.includes("menor salud metodológica global")
    )
  );
};
