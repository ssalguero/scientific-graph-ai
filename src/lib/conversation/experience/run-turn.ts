import { buildScientificContext, retrieveGrounding } from "./grounding";
import { createGenerationPort } from "./generation-port";
import { applySafetyToOutput, inspectSafety } from "./safety-gate";
import {
  AI_EXPLANATION_DISCLOSURE,
  GENERATION_UNAVAILABLE_DISCLOSURE,
} from "./types";
import type {
  ConversationMessage,
  ConversationTurnInput,
  ConversationTurnResult,
  GenerationPort,
} from "./types";

const MAX_HISTORY = 16;

export async function runConversationTurn(
  input: ConversationTurnInput,
  options?: { port?: GenerationPort }
): Promise<ConversationTurnResult> {
  const text = input.text.trim();
  const history = input.history.slice(-MAX_HISTORY);
  const product = input.product;
  const scientific = buildScientificContext(product);
  const safety = inspectSafety(text, product);
  const grounding = retrieveGrounding(text, product, scientific, safety);
  const messages: ConversationMessage[] = [
    ...history,
    { role: "user", content: text },
  ];

  const port = options?.port ?? createGenerationPort();
  const generated = await port.generate({
    messages,
    product,
    scientific,
    grounding,
    safety,
  });

  const reply = applySafetyToOutput(generated.text, safety);
  const nextHistory: ConversationMessage[] = [
    ...messages,
    { role: "assistant", content: reply },
  ];
  const generatedByProvider =
    generated.source === "http-provider" || generated.source === "injected";

  return {
    text: reply,
    source: generated.source,
    disclosure: generatedByProvider
      ? AI_EXPLANATION_DISCLOSURE
      : GENERATION_UNAVAILABLE_DISCLOSURE,
    history: nextHistory.slice(-MAX_HISTORY),
    safety,
  };
}
