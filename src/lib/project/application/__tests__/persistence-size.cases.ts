import { PROJECT_SIZE_WARN_BYTES } from "../../constants";
import {
  assessProjectSizeWarning,
  PROJECT_SIZE_APPROACHING_RATIO,
} from "../persistence-size";
import {
  createAssertCase,
  type CaseResult,
} from "@/lib/scientific/comparison/__tests__/run-assertions";

export const runPersistenceSizeApplicationCaseSuite = (): CaseResult[] => {
  const results: CaseResult[] = [];
  const assertCase = createAssertCase(results);

  const threshold = PROJECT_SIZE_WARN_BYTES;
  const approaching = Math.floor(threshold * PROJECT_SIZE_APPROACHING_RATIO);

  const small = assessProjectSizeWarning({
    byteLength: 1024,
    thresholdBytes: threshold,
  });
  assertCase("app.size.none.tier", small.tier === "none");
  assertCase("app.size.none.codes", small.issueCodes.length === 0);

  const near = assessProjectSizeWarning({
    byteLength: approaching,
    thresholdBytes: threshold,
  });
  assertCase("app.size.approaching.tier", near.tier === "approaching");

  const exceeded = assessProjectSizeWarning({
    byteLength: threshold + 1,
    thresholdBytes: threshold,
  });
  assertCase("app.size.exceeded.bytes", exceeded.tier === "exceeded");

  const fromCode = assessProjectSizeWarning({
    byteLength: 1024,
    thresholdBytes: threshold,
    issueCodes: ["S-SIZE"],
  });
  assertCase("app.size.exceeded.fromCode", fromCode.tier === "exceeded");
  assertCase(
    "app.size.exceeded.codePreserved",
    fromCode.issueCodes.includes("S-SIZE")
  );

  const parseCode = assessProjectSizeWarning({
    byteLength: 1024,
    thresholdBytes: threshold,
    issueCodes: ["P-SIZE", "OTHER"],
  });
  assertCase(
    "app.size.parseCodeOnly",
    parseCode.issueCodes.length === 1 && parseCode.issueCodes[0] === "P-SIZE"
  );

  assertCase(
    "app.size.ratio.constant",
    PROJECT_SIZE_APPROACHING_RATIO === 0.8
  );

  assertCase(
    "app.size.thresholdMatchesConstant",
    threshold === 10 * 1024 * 1024
  );

  const belowApproaching = assessProjectSizeWarning({
    byteLength: approaching - 1,
    thresholdBytes: threshold,
  });
  assertCase("app.size.belowApproaching.none", belowApproaching.tier === "none");

  return results;
};
