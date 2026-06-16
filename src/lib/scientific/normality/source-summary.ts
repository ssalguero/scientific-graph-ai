import type {
  CanonicalNormalityKernelInput,
  CanonicalNormalityNormalityInput,
  CanonicalNormalityQQInput,
  CanonicalNormalityViolinInput,
} from "./input-types";
import { getNormalityClassificationLabel } from "./labels";
import {
  getKernelSourceSummaryMessage,
  getQQPlotSourceSummaryLabel,
  getViolinSourceSummaryMessage,
} from "./source-labels";

export const buildCanonicalNormalitySourceSummary = (
  normality: CanonicalNormalityNormalityInput | undefined,
  qqPlot: CanonicalNormalityQQInput | undefined,
  violinPlot: CanonicalNormalityViolinInput | undefined,
  kernelDensity: CanonicalNormalityKernelInput | undefined
): string[] => {
  const sourceSummary: string[] = [];

  if (normality) {
    sourceSummary.push(
      `SCI-11: ${getNormalityClassificationLabel(normality.classification)}`
    );
  }
  if (qqPlot) {
    sourceSummary.push(
      `SCI-21: ${getQQPlotSourceSummaryLabel(qqPlot.interpretation)}`
    );
  }
  if (violinPlot) {
    sourceSummary.push(
      `SCI-22: ${getViolinSourceSummaryMessage(violinPlot.shapeInterpretation)}`
    );
  }
  if (kernelDensity) {
    sourceSummary.push(
      `SCI-26: ${getKernelSourceSummaryMessage(kernelDensity.distributionShape)}`
    );
  }

  return sourceSummary;
};
