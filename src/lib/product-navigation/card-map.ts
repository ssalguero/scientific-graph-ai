import type { SmartStartCardOptionId } from "@/lib/smart-start/types";

import type { ProductScreenId } from "./screens";

/** Home Cards → ProductScreenId. Not Tabs. */
export const CARD_OPTION_TO_PRODUCT_SCREEN: Record<
  SmartStartCardOptionId,
  ProductScreenId
> = {
  "analyze-dataset": "importar",
  "compare-datasets": "comparar",
  "math-graph": "graph",
  "constructor-visual": "vgb",
  "analyze-workspace": "analizar",
  "evaluate-publication": "evaluar-metodologia",
};

export function productScreenForCardOption(
  optionId: string
): ProductScreenId | null {
  if (optionId in CARD_OPTION_TO_PRODUCT_SCREEN) {
    return CARD_OPTION_TO_PRODUCT_SCREEN[optionId as SmartStartCardOptionId];
  }
  return null;
}
