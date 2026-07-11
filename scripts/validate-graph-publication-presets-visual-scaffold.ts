import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";

import { resolvePublicationPreset } from "@/lib/graph/publication-presets/resolve";
import type { PublicationPresetId } from "@/lib/graph/publication-presets/types";
import {
  createAssertCase,
  type CaseResult,
} from "@/lib/scientific/comparison/__tests__/run-assertions";

import { emitGateSummary } from "./lib/methodology-gate-utils";

const REPO_ROOT = process.cwd();
const SNAPSHOT_PATH = path.join(
  REPO_ROOT,
  "scripts",
  "fixtures",
  "publication-presets-visual-scaffold.snapshot.json"
);

type PresetSnapshotFile = {
  version: number;
  algorithm: string;
  source: string;
  presets: Record<PublicationPresetId, { sha256: string }>;
};

const hashChartRenderTokens = (presetId: PublicationPresetId): string => {
  const tokens = resolvePublicationPreset(presetId);
  return createHash("sha256").update(JSON.stringify(tokens), "utf8").digest("hex");
};

export const runPublicationPresetsVisualScaffoldCaseSuite = (): CaseResult[] => {
  const results: CaseResult[] = [];
  const assertCase = createAssertCase(results);

  assertCase(
    "scaffold.snapshot.exists",
    fs.existsSync(SNAPSHOT_PATH)
  );

  const snapshotText = fs.readFileSync(SNAPSHOT_PATH, "utf8");
  const snapshot = JSON.parse(snapshotText) as PresetSnapshotFile;

  assertCase(
    "scaffold.snapshot.schema",
    snapshot.version === 1 &&
      snapshot.algorithm === "sha256" &&
      typeof snapshot.presets.default?.sha256 === "string" &&
      typeof snapshot.presets.journal?.sha256 === "string" &&
      typeof snapshot.presets.presentation?.sha256 === "string"
  );

  const presetIds: PublicationPresetId[] = ["default", "journal", "presentation"];
  for (const presetId of presetIds) {
    const actualHash = hashChartRenderTokens(presetId);
    const expectedHash = snapshot.presets[presetId]?.sha256 ?? "";
    assertCase(`scaffold.hash.${presetId}`, actualHash === expectedHash, actualHash);
  }

  const deterministicA = hashChartRenderTokens("journal");
  const deterministicB = hashChartRenderTokens("journal");
  assertCase("scaffold.determinism", deterministicA === deterministicB);

  const driftProbe = JSON.parse(JSON.stringify(resolvePublicationPreset("default"))) as Record<
    string,
    unknown
  >;
  if (typeof driftProbe.series === "object" && driftProbe.series !== null) {
    (driftProbe.series as { strokeWidth: number }).strokeWidth = -1;
  }
  const driftHash = createHash("sha256")
    .update(JSON.stringify(driftProbe), "utf8")
    .digest("hex");
  assertCase(
    "scaffold.drift",
    driftHash !== snapshot.presets.default.sha256
  );

  return results;
};

const results = runPublicationPresetsVisualScaffoldCaseSuite();
emitGateSummary("graph-publication-presets-visual-scaffold", results);
