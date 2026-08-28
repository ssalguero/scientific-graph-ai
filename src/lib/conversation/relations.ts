import type { ConversationDomainId } from "./contract";

/**
 * Product capability relations. Not a scientific-method catalog.
 * Not a replacement for Home concept-vocabulary.
 * Used by the Conversation Core to understand cross-domain questions
 * even when the related domain adapter is still unwired.
 */
export const PRODUCT_RELATION_MAP = {
  home: ["analyze", "compare", "math"],
  compare: ["analyze", "results", "reports"],
  analyze: ["compare", "math", "evaluate", "results"],
  math: ["analyze", "compare"],
  evaluate: ["analyze", "results", "reports"],
  results: ["analyze", "compare", "reports"],
  advanced: ["analyze", "math"],
  reports: ["results", "evaluate"],
} as const satisfies Record<
  ConversationDomainId,
  readonly ConversationDomainId[]
>;

export type ProductRelationMap = typeof PRODUCT_RELATION_MAP;

export function relatedConversationDomains(
  domain: ConversationDomainId | null
): readonly ConversationDomainId[] {
  if (!domain) return [];
  return PRODUCT_RELATION_MAP[domain];
}

export function productAreasAreRelated(
  from: ConversationDomainId | null,
  toward: ConversationDomainId
): boolean {
  if (!from) return true;
  if (from === toward) return true;
  return relatedConversationDomains(from).includes(toward);
}
