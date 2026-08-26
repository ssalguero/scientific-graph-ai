import { classifyIntent } from "./classify-intent";
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

/** Longest first so "y si ya tengo los datos" wins over "y si ya tengo". */
const FOLLOW_UP_CUES = [
  "y si ya tengo los datos",
  "y si ya tengo",
  "cuando se utiliza",
  "cuando se usa",
  "y la regresion",
  "como se usa",
  "donde esta",
  "y eso que",
  "y pearson",
  "por que",
  "y eso",
  "donde",
  "como",
] as const;

const FOLLOW_UP_REST = new Set([
  "y",
  "eso",
  "que",
  "los",
  "datos",
  "el",
  "la",
  "un",
  "una",
  "de",
  "del",
  "a",
  "al",
  "me",
  "mi",
  "mis",
  "lo",
  "las",
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
  text: string,
  previous: HomeGuidanceConversationState
): boolean {
  if (!hasPriorContext(previous)) return false;
  for (const cue of FOLLOW_UP_CUES) {
    const padded = ` ${cue} `;
    if (!text.includes(padded)) continue;
    const leftover = text.replace(padded, " ");
    const tokens = leftover.trim().split(/\s+/).filter(Boolean);
    if (tokens.every((token) => FOLLOW_UP_REST.has(token))) return true;
  }
  return false;
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
  if (isContextualFollowUp(text, previous)) return "follow_up";
  return "new_intent";
}
