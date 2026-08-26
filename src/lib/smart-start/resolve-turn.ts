import { classifyIntent } from "./classify-intent";
import { matchFollowUpCue } from "./follow-up-catalog";
import { normalizeGuidanceText } from "./normalize-intent-text";
import type {
  GuidanceClarificationSlot,
  GuidanceTurnType,
  HomeGuidanceConversationState,
} from "./types";

const CLOSE_PHRASES = new Set([
  "gracias",
  "muchas gracias",
  "no",
  "no gracias",
  "nada mas",
  "eso es todo",
  "listo",
]);

const TOPIC_CHANGE_IDS = new Set([
  "compare-datasets",
  "math-graph",
  "evaluate-publication",
  "expert-mode",
  "open-project",
]);

function hasPriorContext(previous: HomeGuidanceConversationState): boolean {
  return (
    previous.lastDecision !== null ||
    previous.userConcepts.length > 0 ||
    previous.speechAct !== "unknown"
  );
}

function isClosingUtterance(text: string): boolean {
  let body = text.trim();
  if (body.startsWith("ok ")) body = body.slice(3).trim();
  return CLOSE_PHRASES.has(body);
}

function isTopicChange(
  input: string,
  previous: HomeGuidanceConversationState
): boolean {
  if (previous.turnCount <= 0 && previous.lastDecision === null) return false;
  const winner = classifyIntent(input);
  return Boolean(winner && TOPIC_CHANGE_IDS.has(winner.intentId));
}

function isContinuationSlot(slot: GuidanceClarificationSlot): boolean {
  return slot !== null && slot !== "data_source";
}

function isContextualFollowUp(
  input: string,
  previous: HomeGuidanceConversationState
): boolean {
  if (!hasPriorContext(previous)) return false;
  return matchFollowUpCue(input) !== null;
}

/**
 * Deterministic turn classifier. Does not change classifyIntent or guidance copy.
 * First match wins.
 */
export function resolveTurnType(
  input: string,
  previous: HomeGuidanceConversationState
): GuidanceTurnType {
  const text = normalizeGuidanceText(input);
  if (text.trim().length === 0) return "new_intent";
  if (isClosingUtterance(text)) return "closing";
  if (isTopicChange(input, previous)) return "topic_change";
  if (previous.pendingSlot === "data_source" && previous.clarificationAsked) {
    return "clarification";
  }
  if (isContinuationSlot(previous.pendingSlot)) return "continuation_answer";
  if (isContextualFollowUp(input, previous)) return "follow_up";
  return "new_intent";
}
