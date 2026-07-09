/**
 * D27.5 — Medición documental bubble (no bloqueante).
 */
import { readFileSync } from "node:fs";
import { performance } from "node:perf_hooks";
import { join } from "node:path";

import { hydrateProjectJson } from "@/lib/project";
import {
  buildVisualGraphPreview,
  DEFAULT_VISUAL_GRAPH_SPECIFICATION,
} from "@/lib/visualGraphBuilder";
import { seriesToWorksheet } from "@/lib/experimentalWorksheet";

const REPO_ROOT = join(import.meta.dirname, "..");
const ITERATIONS = 100;
const DATASET_FIXTURE = "project-v2-dataset5-minimal.sgproj";

const median = (values: number[]) => {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1]! + sorted[mid]!) / 2
    : sorted[mid]!;
};

const fixtureText = readFileSync(
  join(REPO_ROOT, "scripts", "fixtures", DATASET_FIXTURE),
  "utf8"
);
const hydrated = hydrateProjectJson(fixtureText);
if (!hydrated.ok) {
  console.log(
    JSON.stringify({
      phase: "prod2e-d27-bubble-perf",
      pass: false,
      blocking: false,
      error: "Failed to hydrate dataset5 minimal fixture",
    })
  );
  process.exit(0);
}

const primaryDataset = hydrated.patch.sessionDatasets.find(
  (dataset) => dataset.id === "00000000-0000-4000-8000-000000000002::primary"
);
if (!primaryDataset) {
  console.log(
    JSON.stringify({
      phase: "prod2e-d27-bubble-perf",
      pass: false,
      blocking: false,
      error: "Primary dataset missing from dataset5 minimal fixture",
    })
  );
  process.exit(0);
}

const series = primaryDataset.datasetPayload.series;
const model = seriesToWorksheet(series);
const registry = primaryDataset.datasetPayload.columnRegistry ?? {};
const bubbleSpec = {
  ...DEFAULT_VISUAL_GRAPH_SPECIFICATION,
  graphType: "bubble" as const,
  xVariable: "x",
  yVariable: "d5-control1",
  sizeVariable: "d5-tratamiento1",
  groupVariable: null,
};

const durationsMs: number[] = [];
for (let index = 0; index < ITERATIONS; index += 1) {
  const start = performance.now();
  buildVisualGraphPreview(bubbleSpec, model, registry);
  durationsMs.push(performance.now() - start);
}

const summary = {
  phase: "prod2e-d27-bubble-perf",
  pass: true,
  blocking: false,
  dataset: DATASET_FIXTURE,
  graphType: "bubble",
  iterations: ITERATIONS,
  medianMs: Number(median(durationsMs).toFixed(4)),
  p95Ms: Number(
    durationsMs.sort((a, b) => a - b)[Math.floor(ITERATIONS * 0.95)]!.toFixed(4)
  ),
  note: "Documental — no bloquea cierre D27.5",
};

console.log(JSON.stringify(summary, null, 2));
process.exit(0);
