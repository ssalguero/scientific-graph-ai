import fs from "node:fs";
import path from "node:path";

import { computeYAxisDomainFromValues } from "@/lib/graph/viewport";
import {
  mapLineStyleToStrokeDasharray,
  resolveGraphRenderStyle,
} from "@/lib/graph/publication-presets/resolve";
import type { ChartRenderTokens } from "@/lib/graph/publication-presets/types";
import { collectProjectSnapshotV2 } from "@/lib/project/collect-project-snapshot-v2";
import { persistedVisualGraphsEquivalent } from "@/lib/project/domain/mappers/visual-graph";
import { serializeProjectV2 } from "@/lib/project/serialize-project-v2";
import { sanitizeScientificProjectV2 } from "@/lib/project/sanitize-project-v2";
import {
  createAssertCase,
  type CaseResult,
} from "@/lib/scientific/comparison/__tests__/run-assertions";

import {
  assertNoPublicationPresetRenderLeakInJson,
  buildSampleVisualGraphPersisted,
  SAMPLE_VGB_JOURNAL_PRESET_SPEC_INPUT,
  SAMPLE_VGB_SCATTER_SPEC_INPUT,
} from "../../src/lib/project/__tests__/visual-graph-mapper-helpers";
import {
  buildHydratePatchFromProject,
  buildVisualGraphHydrateCollectContext,
  HYDRATE_VGB_PRIMARY_ID,
  patchToCollectContextV2WithVisualGraphs,
  runVisualGraphHydrateRoundTrip,
} from "../../src/lib/project/__tests__/visual-graph-hydrate-helpers";

const REPO_ROOT = process.cwd();
const PRESET_MODULE_ROOT = path.join(REPO_ROOT, "src/lib/graph/publication-presets");

const collectPublicationPresetsSources = (): string[] => {
  const files: string[] = [];
  const walk = (dir: string) => {
    for (const name of fs.readdirSync(dir)) {
      const abs = path.join(dir, name);
      if (fs.statSync(abs).isDirectory()) {
        walk(abs);
      } else if (name.endsWith(".ts")) {
        files.push(abs);
      }
    }
  };
  walk(PRESET_MODULE_ROOT);
  return files;
};

export const runPublicationPresetsGateExtensionCaseSuite = (): CaseResult[] => {
  const results: CaseResult[] = [];
  const assertCase = createAssertCase(results);

  const journalPersisted = buildSampleVisualGraphPersisted({
    graphId: "vg-gate-journal",
    sourceDatasetId: HYDRATE_VGB_PRIMARY_ID,
    specInput: SAMPLE_VGB_JOURNAL_PRESET_SPEC_INPUT,
  });
  const journalProject = collectProjectSnapshotV2(buildVisualGraphHydrateCollectContext());
  journalProject.visualGraphs = [journalPersisted];
  const journalRoundTrip = runVisualGraphHydrateRoundTrip(
    patchToCollectContextV2WithVisualGraphs(buildHydratePatchFromProject(journalProject))
  );

  assertCase(
    "persist.roundtrip.journal",
    journalRoundTrip.firstProject.visualGraphs?.[0]?.graphSpec.publicationPresetId ===
      "journal" &&
      journalRoundTrip.secondProject.visualGraphs?.[0]?.graphSpec.publicationPresetId ===
        "journal" &&
      persistedVisualGraphsEquivalent(
        journalRoundTrip.firstProject.visualGraphs![0]!,
        journalRoundTrip.secondProject.visualGraphs![0]!
      )
  );

  const nullPersisted = buildSampleVisualGraphPersisted({
    graphId: "vg-gate-null",
    sourceDatasetId: HYDRATE_VGB_PRIMARY_ID,
    specInput: {
      ...SAMPLE_VGB_SCATTER_SPEC_INPUT,
      publicationPresetId: null,
    },
  });
  const nullProject = collectProjectSnapshotV2(buildVisualGraphHydrateCollectContext());
  nullProject.visualGraphs = [nullPersisted];
  const nullRoundTrip = runVisualGraphHydrateRoundTrip(
    patchToCollectContextV2WithVisualGraphs(buildHydratePatchFromProject(nullProject))
  );

  assertCase(
    "persist.roundtrip.null",
    nullRoundTrip.secondProject.visualGraphs?.[0]?.graphSpec.publicationPresetId === null
  );

  const journalSerialized = serializeProjectV2({
    project: journalRoundTrip.secondProject,
    appVersion: "0.1.0",
    options: { includeChecksum: false },
  });

  assertCase(
    "persist.vgbR1.noTokenLeak",
    journalSerialized.ok === true &&
      assertNoPublicationPresetRenderLeakInJson(journalSerialized.json) &&
      !journalSerialized.json.includes('"lineStrokeDasharray"')
  );

  const invalidProject = collectProjectSnapshotV2(buildVisualGraphHydrateCollectContext());
  invalidProject.visualGraphs = [
    {
      ...journalPersisted,
      graphSpec: {
        ...journalPersisted.graphSpec,
        publicationPresetId: "invalid-preset-id",
      },
    },
  ];
  const invalidSanitized = sanitizeScientificProjectV2(invalidProject);

  assertCase(
    "persist.validate.invalidId",
    invalidSanitized.project.visualGraphs?.[0]?.graphSpec.publicationPresetId === null
  );

  const presetSources = collectPublicationPresetsSources();
  assertCase(
    "regression.viewport.y",
    presetSources.every((filePath) => {
      const source = fs.readFileSync(filePath, "utf8");
      return (
        !source.includes("@/lib/graph/viewport") &&
        !source.includes("../viewport") &&
        !source.includes("computeYAxisDomainFromValues")
      );
    }) &&
      (() => {
        const domain = computeYAxisDomainFromValues([1, 2, 3]);
        return domain !== undefined && domain[0] < domain[1];
      })()
  );

  const mergedStyle = resolveGraphRenderStyle({
    publicationPresetId: "journal",
    color: "#abcdef",
  });
  assertCase(
    "preset.merge.marker",
    !("marker" in (mergedStyle as unknown as Record<string, unknown>)) &&
      !("markerSize" in (mergedStyle as unknown as Record<string, unknown>))
  );

  assertCase(
    "preset.merge.lineStyle",
    mapLineStyleToStrokeDasharray("dashed") === "8 4" &&
      mapLineStyleToStrokeDasharray("dotted") === "4 4" &&
      mapLineStyleToStrokeDasharray("solid") === undefined
  );

  const tokenKeys = Object.keys(mergedStyle as ChartRenderTokens).sort();
  assertCase(
    "preset.merge.lineStyle.noTokenPollution",
    !tokenKeys.includes("lineStrokeDasharray") && !tokenKeys.includes("lineStyle")
  );

  return results;
};
