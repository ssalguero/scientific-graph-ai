import type { NormalityConsensus } from "./types";

export const getCanonicalNormalityScore = (
  conclusion: NormalityConsensus["conclusion"]
) => {
  if (conclusion === "normal") return 100;
  if (conclusion === "probably-normal") return 80;
  if (conclusion === "questionable") return 50;
  if (conclusion === "contradictory") return 40;
  return 20;
};
