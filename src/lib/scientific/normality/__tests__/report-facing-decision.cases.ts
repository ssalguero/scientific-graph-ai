import {
  createAssertCase,
  type CaseResult,
} from "@/lib/scientific/comparison/__tests__/run-assertions";
import { resolveInferentialWorkflowToggles } from "@/lib/scientific/workflow/inferential";
import {
  buildCanonicalNormalityAssessment,
  buildScientificReportNormalityContent,
  doesCanonicalAssessmentSupportNormality,
  LEGACY_SCI11_REPORT_FACING_COMPATIBLE_PHRASE,
  resolveStatisticalRecommendedTest,
} from "@/lib/scientific/normality";

const AUDITOR_SCI11 = [
  {
    seriesName: "Control",
    classification: "approximately-normal" as const,
    sampleSize: 5,
    confidence: "low" as const,
  },
  {
    seriesName: "Treatment_A",
    classification: "approximately-normal" as const,
    sampleSize: 5,
    confidence: "low" as const,
  },
  {
    seriesName: "Treatment_B",
    classification: "approximately-normal" as const,
    sampleSize: 5,
    confidence: "low" as const,
  },
];

export const runReportFacingNormalityDecisionCaseSuite = (): CaseResult[] => {
  const results: CaseResult[] = [];
  const assertCase = createAssertCase(results);

  const auditorAssessment = buildCanonicalNormalityAssessment(
    AUDITOR_SCI11,
    [
      { seriesName: "Control", interpretation: "good" },
      { seriesName: "Treatment_A", interpretation: "good" },
      { seriesName: "Treatment_B", interpretation: "good" },
    ],
    [
      { seriesName: "Control", shapeInterpretation: "symmetric" },
      { seriesName: "Treatment_A", shapeInterpretation: "right-skewed" },
      { seriesName: "Treatment_B", shapeInterpretation: "right-skewed" },
    ],
    [
      { seriesName: "Control", distributionShape: "symmetric" },
      { seriesName: "Treatment_A", distributionShape: "symmetric" },
      { seriesName: "Treatment_B", distributionShape: "symmetric" },
    ]
  );

  const control = auditorAssessment.seriesAssessments.find(
    (series) => series.seriesName === "Control"
  );
  const treatmentA = auditorAssessment.seriesAssessments.find(
    (series) => series.seriesName === "Treatment_A"
  );
  const treatmentB = auditorAssessment.seriesAssessments.find(
    (series) => series.seriesName === "Treatment_B"
  );

  assertCase(
    "cc01.auditor.canonical.control-questionable",
    control?.conclusion === "questionable",
    control?.conclusion
  );
  assertCase(
    "cc01.auditor.canonical.treatment-a-contradictory",
    treatmentA?.conclusion === "contradictory",
    treatmentA?.conclusion
  );
  assertCase(
    "cc01.auditor.canonical.treatment-b-contradictory",
    treatmentB?.conclusion === "contradictory",
    treatmentB?.conclusion
  );

  const reportFacingSupports =
    doesCanonicalAssessmentSupportNormality(auditorAssessment);
  assertCase(
    "cc01.auditor.report-facing.does-not-support-normality",
    reportFacingSupports === false
  );

  const reportContent = buildScientificReportNormalityContent(
    auditorAssessment,
    AUDITOR_SCI11
  );
  const reportText = [...reportContent.summaryLines, ...reportContent.sectionLines].join(
    "\n"
  );

  assertCase(
    "cc01.auditor.summary.no-legacy-compatible-phrase",
    !reportContent.summaryLines.includes(
      LEGACY_SCI11_REPORT_FACING_COMPATIBLE_PHRASE
    ) && !reportText.includes(LEGACY_SCI11_REPORT_FACING_COMPATIBLE_PHRASE)
  );
  assertCase(
    "cc01.auditor.summary.uses-canonical-contradiction",
    reportContent.summaryLines.some((line) =>
      line.includes("señales contradictorias")
    ),
    reportContent.summaryLines.join(" | ")
  );
  assertCase(
    "cc01.auditor.section.matches-summary-decision",
    reportContent.sectionLines[0] === reportContent.summaryLines[0]
  );
  assertCase(
    "cc01.auditor.diagnostics.sci11-preserved",
    AUDITOR_SCI11.every((analysis) =>
      reportContent.sectionLines.some(
        (line) =>
          line.includes(`"${analysis.seriesName}"`) &&
          line.includes("SCI-11") &&
          line.includes("Aproximadamente normal")
      )
    )
  );

  const inferentialToggles = resolveInferentialWorkflowToggles({
    seriesCount: 3,
    totalObservations: 15,
    canonicalNormalityAssessment: auditorAssessment,
  });
  assertCase(
    "cc01.auditor.inferential.nonparametric",
    inferentialToggles.includes("showNonParametric") &&
      !inferentialToggles.includes("showAnova")
  );

  const supportiveAssessment = buildCanonicalNormalityAssessment(
    [
      { seriesName: "A", classification: "normal" },
      { seriesName: "B", classification: "normal" },
    ],
    [
      { seriesName: "A", interpretation: "excellent" },
      { seriesName: "B", interpretation: "excellent" },
    ],
    [
      { seriesName: "A", shapeInterpretation: "symmetric" },
      { seriesName: "B", shapeInterpretation: "symmetric" },
    ],
    [
      { seriesName: "A", distributionShape: "symmetric" },
      { seriesName: "B", distributionShape: "symmetric" },
    ]
  );
  assertCase(
    "cc01.general.supportive.true",
    doesCanonicalAssessmentSupportNormality(supportiveAssessment)
  );
  const supportiveReport = buildScientificReportNormalityContent(
    supportiveAssessment,
    [
      {
        seriesName: "A",
        sampleSize: 40,
        classification: "normal",
        confidence: "high",
      },
      {
        seriesName: "B",
        sampleSize: 40,
        classification: "normal",
        confidence: "high",
      },
    ]
  );
  assertCase(
    "cc01.general.supportive.headline-coherent",
    supportiveReport.summaryLines.some((line) =>
      line.includes("coherente con normalidad")
    ) &&
      !supportiveReport.summaryLines.includes(
        LEGACY_SCI11_REPORT_FACING_COMPATIBLE_PHRASE
      )
  );
  assertCase(
    "cc01.general.supportive.sci11-diagnostic-still-present",
    supportiveReport.sectionLines.some((line) => line.includes("SCI-11 Normal"))
  );

  const probablyNormalAssessment = buildCanonicalNormalityAssessment(
    [{ seriesName: "A", classification: "approximately-normal" }],
    [{ seriesName: "A", interpretation: "moderate" }],
    [{ seriesName: "A", shapeInterpretation: "symmetric" }],
    [{ seriesName: "A", distributionShape: "symmetric" }]
  );
  assertCase(
    "cc01.general.probably-normal.supportive",
    probablyNormalAssessment.seriesAssessments[0]?.conclusion ===
      "probably-normal" &&
      doesCanonicalAssessmentSupportNormality(probablyNormalAssessment)
  );
  assertCase(
    "cc01.general.probably-normal.headline-reservations",
    probablyNormalAssessment.globalConclusion.some((line) =>
      line.includes("con reservas")
    ),
    probablyNormalAssessment.globalConclusion.join(" | ")
  );

  const emptyReport = buildScientificReportNormalityContent(
    { seriesAssessments: [], globalConclusion: [], warnings: [] },
    []
  );
  assertCase(
    "cc01.general.empty.no-series-message",
    emptyReport.sectionLines[0] ===
      "No hay series disponibles para evaluar normalidad." &&
      emptyReport.summaryLines.length === 0
  );

  const auditorMethodWithCorrelation = resolveStatisticalRecommendedTest({
    groupCount: 3,
    correlationRequested: true,
    canonicalNormalityPassed: doesCanonicalAssessmentSupportNormality(
      auditorAssessment
    ),
  });
  assertCase(
    "cc02.auditor.correlation.spearman-not-pearson",
    auditorMethodWithCorrelation?.recommendedTest === "Spearman"
  );
  assertCase(
    "cc02.auditor.correlation.not-pearson-with-failed-normality",
    auditorMethodWithCorrelation?.recommendedTest !== "Pearson"
  );

  const auditorMethodWithoutCorrelation = resolveStatisticalRecommendedTest({
    groupCount: 3,
    correlationRequested: false,
    canonicalNormalityPassed: false,
  });
  assertCase(
    "cc02.auditor.groups.kruskal-wallis",
    auditorMethodWithoutCorrelation?.recommendedTest === "Kruskal-Wallis"
  );

  const supportivePearson = resolveStatisticalRecommendedTest({
    groupCount: 3,
    correlationRequested: true,
    canonicalNormalityPassed: true,
  });
  assertCase(
    "cc02.general.correlation.pearson-when-canonical-supports",
    supportivePearson?.recommendedTest === "Pearson"
  );

  const supportiveAnova = resolveStatisticalRecommendedTest({
    groupCount: 3,
    correlationRequested: false,
    canonicalNormalityPassed: true,
  });
  assertCase(
    "cc02.general.groups.anova-when-canonical-supports",
    supportiveAnova?.recommendedTest === "ANOVA"
  );

  const twoGroupNonparametric = resolveStatisticalRecommendedTest({
    groupCount: 2,
    correlationRequested: false,
    canonicalNormalityPassed: false,
  });
  assertCase(
    "cc02.general.two-groups.mann-whitney",
    twoGroupNonparametric?.recommendedTest === "Mann-Whitney U"
  );

  const twoGroupParametric = resolveStatisticalRecommendedTest({
    groupCount: 2,
    correlationRequested: false,
    canonicalNormalityPassed: true,
  });
  assertCase(
    "cc02.general.two-groups.t-test",
    twoGroupParametric?.recommendedTest === "t-Test"
  );

  return results;
};
