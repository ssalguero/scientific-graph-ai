import type { IntentRecommendation } from "./types";

export function formatIntentRecommendationSummary(
  recommendation: IntentRecommendation
): string {
  return `Recomendación: ${recommendation.flowLabel} (perfil ${recommendation.profileLabel})`;
}
