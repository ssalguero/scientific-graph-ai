import type { CompareConversationContext } from "./contract";

export type CompareAdapterInput = {
  slotAOccupied: boolean | null;
  slotBOccupied: boolean | null;
  slotAFileName: string | null;
  slotBFileName: string | null;
};

/**
 * Normalizes Compare slot occupancy into conversation context.
 * Does not classify intent, emit orientation, or mutate workspace state.
 */
export function normalizeCompareContext(
  input: CompareAdapterInput
): CompareConversationContext {
  return {
    domain: "compare",
    slotAOccupied: input.slotAOccupied,
    slotBOccupied: input.slotBOccupied,
    slotAFileName: input.slotAOccupied === true ? input.slotAFileName : null,
    slotBFileName: input.slotBOccupied === true ? input.slotBFileName : null,
  };
}
