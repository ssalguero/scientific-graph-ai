/**
 * D59.4 — Snap Foundation · determinism gate.
 * same (geometry, targets, config) → same output · N runs.
 * Authority: D59.0 §11 · D59.1 Engine.
 */
import { applyMagneticSnap } from "../src/components/windows/WindowSnapEngine";
import {
  SNAP_PRIORITY,
  createDefaultSnapConfig,
  type SnapTarget,
} from "../src/components/windows/WindowSnapTypes";

const results: { id: string; pass: boolean; detail: string }[] = [];
const assertCase = (id: string, pass: boolean, detail: string) => {
  results.push({ id, pass, detail });
};

const RUNS = 25;

const geometry = { x: 240, y: 180, width: 320, height: 240 };
const config = createDefaultSnapConfig(8);

const targets: SnapTarget[] = [
  {
    axis: "x",
    position: 245,
    edge: "left",
    kind: "window",
    sourceId: "w2",
    priority: SNAP_PRIORITY.window,
  },
  {
    axis: "x",
    position: 245,
    edge: "left",
    kind: "workspace",
    priority: SNAP_PRIORITY.workspace,
  },
  {
    axis: "y",
    position: 185,
    edge: "top",
    kind: "window",
    sourceId: "w3",
    priority: SNAP_PRIORITY.window,
  },
  {
    axis: "y",
    position: 185,
    edge: "top",
    kind: "workspace",
    priority: SNAP_PRIORITY.workspace,
  },
];

function geoKey(g: { x: number; y: number; width: number; height: number }): string {
  return `${g.x}|${g.y}|${g.width}|${g.height}`;
}

const first = applyMagneticSnap(geometry, targets, config);
const firstKey = geoKey(first);

let allMatch = true;
for (let i = 0; i < RUNS; i++) {
  const next = applyMagneticSnap(
    { ...geometry },
    targets.map((t) => ({ ...t })),
    { ...config }
  );
  if (geoKey(next) !== firstKey) {
    allMatch = false;
    break;
  }
}

assertCase(
  "d59.determinism.nRuns",
  allMatch,
  `${RUNS} runs → identical output (${firstKey})`
);

assertCase(
  "d59.determinism.expectedSnap",
  first.x === 245 && first.y === 185,
  `workspace priority on both axes → x=245 y=185 (got ${firstKey})`
);

const shuffledTargets: SnapTarget[] = [
  targets[2],
  targets[0],
  targets[3],
  targets[1],
];
const shuffled = applyMagneticSnap(geometry, shuffledTargets, config);
assertCase(
  "d59.determinism.inputOrderIndependent",
  geoKey(shuffled) === firstKey,
  "target array order does not change winner selection"
);

const disabled = applyMagneticSnap(geometry, targets, {
  ...config,
  enabled: false,
});
const disabled2 = applyMagneticSnap(geometry, targets, {
  ...config,
  enabled: false,
});
assertCase(
  "d59.determinism.disabledStable",
  geoKey(disabled) === geoKey(disabled2) &&
    disabled.x === geometry.x &&
    disabled.y === geometry.y,
  "disabled path also deterministic"
);

const failed = results.filter((r) => !r.pass);
const summary = {
  phase: "d59-determinism",
  pass: failed.length === 0,
  total: results.length,
  passed: results.length - failed.length,
  failed: failed.map((f) => f.id),
  results,
};

console.log(JSON.stringify(summary, null, 2));
console.log(
  summary.pass
    ? "\nPASS — d59-determinism"
    : `\nFAIL — d59-determinism (${failed.map((f) => f.id).join(", ")})`
);
process.exit(summary.pass ? 0 : 1);
