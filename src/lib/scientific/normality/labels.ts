import type {
  CanonicalNormalityConclusion,
  NormalityConfidence,
  NormalityConsensus,
} from "./types";
import type { NormalityClassification } from "./input-types";

export const getNormalityConfidenceLabel = (confidence: NormalityConfidence) =>
  confidence === "high" ? "Alta" : confidence === "medium" ? "Media" : "Baja";

export const getNormalityClassificationLabel = (
  classification: NormalityClassification | null
) => {
  if (classification === null) return "No disponible";
  if (classification === "normal") return "Normal";
  if (classification === "approximately-normal") return "Aproximadamente normal";
  return "No normal";
};

export const getNormalityConsensusConclusionLabel = (
  conclusion: NormalityConsensus["conclusion"]
) => {
  if (conclusion === "normal") return "Normal";
  if (conclusion === "probably-normal") return "Probablemente normal";
  if (conclusion === "questionable") return "Normalidad cuestionable";
  if (conclusion === "contradictory") return "Señales contradictorias";
  return "No normal";
};

export const getNormalityConsensusEmoji = (
  conclusion: NormalityConsensus["conclusion"]
) => {
  if (conclusion === "normal") return "🟢";
  if (conclusion === "probably-normal") return "🟡";
  if (conclusion === "questionable") return "🟠";
  if (conclusion === "contradictory") return "⚠️";
  return "🔴";
};
