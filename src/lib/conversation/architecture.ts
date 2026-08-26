import type { ConversationDomainId, ConversationContext } from "./contract";

/**
 * P6 architecture freeze. Types only — no Conversation Core runtime,
 * no adapters, no context builders, no query UI.
 *
 * Target architecture:
 * Conversation Core + System Context + Domain Context Adapters + Semantic Orientation
 *
 * P6 will not build independent assistants per domain.
 */

export const CONVERSATION_ARCHITECTURE = {
  singleConversationCore: true,
  independentDomainAssistants: false,
  adaptersNormalizeContextOnly: true,
  orientationIsSemanticNotNavigation: true,
  implemented: false,
} as const;

export type ConversationArchitecture = typeof CONVERSATION_ARCHITECTURE;

/**
 * Named slot for the single future Conversation Core.
 * P6.0 does not implement it. Not a per-domain assistant.
 */
export type ConversationCore = {
  readonly implemented: false;
  readonly single: true;
};

/**
 * Transversal session/product awareness for a future Core.
 * Stub only. Not a builder. Not a workspace mutator.
 */
export type SystemContext = {
  hasDataset: boolean | null;
  hasExperimentalSeries: boolean | null;
  activeConversationDomain: ConversationDomainId | null;
};

/**
 * Domain adapters normalize local context for the Conversation Core.
 * They are not conversational brains. They must not produce
 * GuidanceDecision or ConversationOrientation.
 */
export type DomainContextAdapter = {
  domain: ConversationDomainId;
  role: "normalize_context";
  context: ConversationContext;
};
