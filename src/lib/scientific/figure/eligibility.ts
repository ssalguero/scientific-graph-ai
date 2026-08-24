import type { GeneratedTextReviewRecord } from "@/lib/scientific/contracts";
import type { ScientificSemanticProjection } from "@/lib/scientific/contracts";
import type { GraphSpecification } from "@/lib/visualGraphBuilder";

export type VgbVisualTruthAssessment = {
  eligible: boolean;
  reasons: readonly string[];
};

const hasField = (
  projection: ScientificSemanticProjection,
  field: string
): boolean => projection.semanticValues.some((value) => value.field === field);

/**
 * Visual-truth eligibility consumes existing semantic projection fields.
 * It does not recalculate error bars, box geometry or violin strips.
 */
export const assessVgbVisualTruth = (input: {
  graphSpec: GraphSpecification;
  projection: ScientificSemanticProjection | null;
}): VgbVisualTruthAssessment => {
  const reasons: string[] = [];
  if (!input.projection) {
    return {
      eligible: false,
      reasons: [
        "No hay proyección semántica autoritativa para la figura de trabajo.",
      ],
    };
  }
  if (!hasField(input.projection, "figure.scientificConfiguration")) {
    reasons.push("Falta la configuración científica de la figura.");
  }
  const valueFields = input.projection.semanticValues.filter((value) =>
    value.field.startsWith("values.")
  );
  if (valueFields.length === 0) {
    reasons.push("La figura no contiene valores científicos proyectados.");
  }
  if (
    input.graphSpec.errorBars !== "none" &&
    hasField(input.projection, "values.barData")
  ) {
    const bar = input.projection.semanticValues.find(
      (value) => value.field === "values.barData"
    );
    if (!bar?.uncertainty) {
      reasons.push(
        "Las barras de error están configuradas pero la incertidumbre no está proyectada."
      );
    }
  }
  if (input.graphSpec.graphType === "boxPlot" && !hasField(input.projection, "values.boxPlotData")) {
    reasons.push("La figura de caja no conserva el resumen de cinco números.");
  }
  if (
    input.graphSpec.graphType === "violin" &&
    !hasField(input.projection, "values.rawValueStrip")
  ) {
    reasons.push("La figura de violín no conserva la tira de valores crudos.");
  }
  return { eligible: reasons.length === 0, reasons };
};

export const canPromoteVgbFigureToPublication = (input: {
  visualTruth: VgbVisualTruthAssessment;
  review: GeneratedTextReviewRecord | null;
}): { allowed: boolean; reasons: readonly string[] } => {
  const reasons: string[] = [];
  if (!input.visualTruth.eligible) {
    reasons.push(...input.visualTruth.reasons);
  }
  if (!input.review) {
    reasons.push("La figura no tiene autoridad de revisión CTR-08.");
  } else {
    if (input.review.state !== "RESEARCHER_APPROVED") {
      reasons.push(
        "Solo una figura con aprobación explícita de la persona investigadora puede publicarse."
      );
    }
    if (input.review.validity !== "CURRENT") {
      reasons.push(
        "La aprobación no está vigente para la evidencia científica actual."
      );
    }
  }
  return { allowed: reasons.length === 0, reasons };
};
