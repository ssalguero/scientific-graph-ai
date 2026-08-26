/**
 * P5.4 / P6.0 layer map. Conversation must not merge with Results or Reports.
 * Results and Reports are distinct unwired domains. Catalogs stay in
 * src/lib/smart-start. This file only names layers.
 */

export const CONVERSATION_LAYER_IDS = [
  "intent_guidance",
  "conversational",
  "analysis_scientific",
  "results_reporting",
] as const;

export type ConversationLayerId = (typeof CONVERSATION_LAYER_IDS)[number];

export const CONVERSATION_LAYER_OWNERS = {
  intent_guidance: [
    "src/lib/smart-start/classify-intent.ts",
    "src/lib/smart-start/intent-rules.ts",
    "src/lib/smart-start/build-guidance-decision.ts",
  ],
  conversational: [
    "src/lib/smart-start/resolve-turn.ts",
    "src/lib/smart-start/follow-up-catalog.ts",
    "src/lib/smart-start/continuation-resolve.ts",
    "src/lib/conversation/contract.ts",
    "src/lib/conversation/architecture.ts",
    "src/lib/conversation/orientation.ts",
    "src/lib/conversation/relations.ts",
    "src/lib/conversation/core.ts",
    "src/lib/conversation/analyze-adapter.ts",
    "src/lib/conversation/system-context.ts",
  ],
  analysis_scientific: [
    "workspace engines and inspector controls (user-driven; not conversation)",
  ],
  results_reporting: [
    "src/app/page.tsx generateScientificAssistantReport (Level 2; not a conversation adapter)",
    "results domain is unwired and distinct from reports",
    "reports domain is unwired; existing publication dashboards are not a conversation adapter",
  ],
} as const satisfies Record<ConversationLayerId, readonly string[]>;
