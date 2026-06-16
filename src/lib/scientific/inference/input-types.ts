import type { NormalityClassification } from "@/lib/scientific/normality";

export type InferentialNormalityInput = {
  seriesName: string;
  classification: NormalityClassification | null;
};
