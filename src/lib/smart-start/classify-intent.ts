import { LAB_USAGE_PROFILE_META } from "@/app/labUsageProfile";

import { INTENT_RULES } from "./intent-rules";
import { keywordMatches, normalizeIntentText } from "./normalize-intent-text";
import type { IntentConfidence, IntentRecommendation } from "./types";

function scoreRule(
  text: string,
  rule: (typeof INTENT_RULES)[number]
): {
  score: number;
  matchedKeywords: string[];
} {
  let score = 0;
  const matchedKeywords: string[] = [];

  for (const keyword of rule.keywords) {
    if (keywordMatches(text, keyword)) {
      matchedKeywords.push(keyword);
      score += keyword.trim().length >= 5 ? 2 : 1;
    }
  }

  return { score, matchedKeywords };
}

export function classifyIntent(input: string): IntentRecommendation | null {
  const text = normalizeIntentText(input);
  if (text.trim().length === 0) {
    return null;
  }

  let best:
    | {
        rule: (typeof INTENT_RULES)[number];
        score: number;
        matchedKeywords: string[];
      }
    | undefined;

  for (const rule of INTENT_RULES) {
    const { score, matchedKeywords } = scoreRule(text, rule);
    if (score <= 0) continue;

    if (
      !best ||
      score > best.score ||
      (score === best.score && rule.priority > best.rule.priority)
    ) {
      best = { rule, score, matchedKeywords };
    }
  }

  if (!best) {
    return null;
  }

  const confidence: IntentConfidence =
    best.score >= 4 ? "high" : best.score >= 2 ? "medium" : "low";

  return {
    intentId: best.rule.id,
    flowLabel: best.rule.flowLabel,
    destinationLabel: best.rule.destinationLabel,
    recommendedProfile: best.rule.recommendedProfile,
    profileLabel: LAB_USAGE_PROFILE_META[best.rule.recommendedProfile].label,
    confidence,
    matchedKeywords: best.matchedKeywords,
  };
}
