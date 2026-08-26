import type { ConversationDomainId, ConversationContext } from "./contract";

/**
 * P6 architecture. Conversation Core runtime may be enabled while the
 * overall P6 series remains incomplete.
 *
 * Conversation Core + System Context + Domain Context Adapters + Semantic Orientation
 *
 * P6 will not build independent assistants per domain.
 */

export const CONVERSATION_ARCHITECTURE = {
  singleConversationCore: true,
  independentDomainAssistants: false,
  adaptersNormalizeContextOnly: true,
  orientationIsSemanticNotNavigation: true,
  coreRuntimeEnabled: true,
  implemented: false,
} as const;

export type ConversationArchitecture = typeof CONVERSATION_ARCHITECTURE;

/**
 * Named slot for the single Conversation Core.
 * Runtime is runConversationCore. This type is not a per-domain assistant.
 * CONVERSATION_ARCHITECTURE.implemented remains false until P6 is complete.
 */
export type ConversationCore = {
  readonly single: true;
};

/**
 * Transversal session/product awareness.
 * activeConversationDomain is where the user is, not a question whitelist.
 * null means no specific conversation domain for the current surface
 * (not lost context). The Core still interprets the question.
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
