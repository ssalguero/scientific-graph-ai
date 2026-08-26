import type { MathConversationContext } from "./contract";

export type MathAdapterInput = {
  constructorPanelOpen: boolean | null;
  hasNonEmptyExpressions: boolean | null;
  hasGraphedCurves: boolean | null;
};

/**
 * Normalizes Math constructor occupancy into conversation context.
 * Does not classify intent, emit orientation, or mutate workspace state.
 */
export function normalizeMathContext(
  input: MathAdapterInput
): MathConversationContext {
  return {
    domain: "math",
    constructorPanelOpen: input.constructorPanelOpen,
    hasNonEmptyExpressions: input.hasNonEmptyExpressions,
    hasGraphedCurves: input.hasGraphedCurves,
  };
}
