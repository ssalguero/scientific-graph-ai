export type StatisticalRecommendedTest =
  | "Pearson"
  | "Spearman"
  | "t-Test"
  | "Mann-Whitney U"
  | "ANOVA"
  | "Kruskal-Wallis";

export const resolveStatisticalRecommendedTest = (input: {
  groupCount: number;
  correlationRequested: boolean;
  canonicalNormalityPassed: boolean;
}): { recommendedTest: StatisticalRecommendedTest; reasoning: string } | null => {
  const { groupCount, correlationRequested, canonicalNormalityPassed } = input;

  if (correlationRequested && groupCount >= 2) {
    return canonicalNormalityPassed
      ? {
          recommendedTest: "Pearson",
          reasoning:
            "Se recomienda Pearson porque se solicitó correlación y la evaluación integrada de normalidad es compatible con ese supuesto.",
        }
      : {
          recommendedTest: "Spearman",
          reasoning:
            "Se recomienda Spearman porque se solicitó correlación y la evaluación integrada de normalidad no respalda el supuesto paramétrico.",
        };
  }

  if (groupCount === 2) {
    return canonicalNormalityPassed
      ? {
          recommendedTest: "t-Test",
          reasoning:
            "Se recomienda t-Test porque existen dos grupos visibles y la evaluación integrada de normalidad es compatible con ese supuesto.",
        }
      : {
          recommendedTest: "Mann-Whitney U",
          reasoning:
            "Se recomienda Mann-Whitney porque la evaluación integrada de normalidad no respalda el supuesto paramétrico.",
        };
  }

  if (groupCount >= 3) {
    return canonicalNormalityPassed
      ? {
          recommendedTest: "ANOVA",
          reasoning: `Se recomienda utilizar ANOVA porque existen ${groupCount} grupos visibles y la evaluación integrada de normalidad es compatible con ese supuesto.`,
        }
      : {
          recommendedTest: "Kruskal-Wallis",
          reasoning: `Se recomienda Kruskal-Wallis porque existen ${groupCount} grupos visibles y la evaluación integrada de normalidad no respalda el supuesto paramétrico.`,
        };
  }

  return null;
};
