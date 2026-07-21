/**
 * D59.4 — Snap Foundation · Engine behavior gate.
 * Runtime fixtures: edges-only, priority, ties, thresholds, immutability.
 * Authority: D59.0 Discovery · D59.1 Engine · D59.3 acceptSnapAxes rule (static).
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  applyMagneticSnap,
  toEdges,
} from "../src/components/windows/WindowSnapEngine";
import {
  SNAP_PRIORITY,
  createDefaultSnapConfig,
  type SnapTarget,
} from "../src/components/windows/WindowSnapTypes";

const repoRoot = process.cwd();
const windowsDir = join(repoRoot, "src/components/windows");

const results: { id: string; pass: boolean; detail: string }[] = [];
const assertCase = (id: string, pass: boolean, detail: string) => {
  results.push({ id, pass, detail });
};

const enginePath = join(windowsDir, "WindowSnapEngine.ts");
const typesPath = join(windowsDir, "WindowSnapTypes.ts");
const resizePath = join(windowsDir, "WindowResizeBridge.ts");

assertCase(
  "d59.engine.filesExist",
  existsSync(enginePath) && existsSync(typesPath),
  "Engine + Types exist"
);

const geometry = { x: 100, y: 100, width: 200, height: 150 };
const config = createDefaultSnapConfig(8);

const inputClone = { ...geometry };
const targetsWorkspace: SnapTarget[] = [
  {
    axis: "x",
    position: 105,
    edge: "left",
    kind: "workspace",
    priority: SNAP_PRIORITY.workspace,
  },
];

const snapped = applyMagneticSnap(geometry, targetsWorkspace, config);

assertCase(
  "d59.engine.immutabilityInput",
  geometry.x === inputClone.x &&
    geometry.y === inputClone.y &&
    geometry.width === inputClone.width &&
    geometry.height === inputClone.height,
  "applyMagneticSnap does not mutate input geometry"
);

assertCase(
  "d59.engine.immutabilityNewObject",
  snapped !== geometry,
  "applyMagneticSnap returns a new object"
);

assertCase(
  "d59.engine.edgesOnlyToEdges",
  (() => {
    const e = toEdges(geometry);
    return (
      e.left === 100 &&
      e.right === 300 &&
      e.top === 100 &&
      e.bottom === 250 &&
      !("center" in e)
    );
  })(),
  "toEdges derives left/right/top/bottom only"
);

assertCase(
  "d59.engine.thresholdSnap",
  snapped.x === 105 && snapped.y === 100,
  `left edge snaps within threshold → x=105 (got x=${snapped.x})`
);

const far = applyMagneticSnap(
  geometry,
  [
    {
      axis: "x",
      position: 50,
      edge: "left",
      kind: "workspace",
      priority: SNAP_PRIORITY.workspace,
    },
  ],
  config
);
assertCase(
  "d59.engine.thresholdReject",
  far.x === 100,
  "distance > axisThresholdX → no snap"
);

const priorityTargets: SnapTarget[] = [
  {
    axis: "x",
    position: 104,
    edge: "left",
    kind: "window",
    sourceId: "other",
    priority: SNAP_PRIORITY.window,
  },
  {
    axis: "x",
    position: 104,
    edge: "left",
    kind: "workspace",
    priority: SNAP_PRIORITY.workspace,
  },
];
const prioritySnap = applyMagneticSnap(geometry, priorityTargets, config);
assertCase(
  "d59.engine.priorityWorkspaceOverWindow",
  prioritySnap.x === 104 && SNAP_PRIORITY.workspace < SNAP_PRIORITY.window,
  "equal distance → Workspace priority wins"
);

/** Equal distance 4: left→104 vs right→296; stable edge order prefers left → x=104. */
const tieTargets: SnapTarget[] = [
  {
    axis: "x",
    position: 296,
    edge: "right",
    kind: "window",
    sourceId: "b",
    priority: SNAP_PRIORITY.window,
  },
  {
    axis: "x",
    position: 104,
    edge: "left",
    kind: "window",
    sourceId: "a",
    priority: SNAP_PRIORITY.window,
  },
];
const tieSnap = applyMagneticSnap(geometry, tieTargets, config);
assertCase(
  "d59.engine.tieBreakStable",
  tieSnap.x === 104,
  `equal distance + priority → left wins over right (got x=${tieSnap.x})`
);

const axisConfig = {
  enabled: true,
  threshold: 8,
  axisThresholdX: 20,
  axisThresholdY: 4,
};
const axisX = applyMagneticSnap(
  geometry,
  [
    {
      axis: "x",
      position: 115,
      edge: "left",
      kind: "workspace",
      priority: SNAP_PRIORITY.workspace,
    },
  ],
  axisConfig
);
const axisY = applyMagneticSnap(
  geometry,
  [
    {
      axis: "y",
      position: 110,
      edge: "top",
      kind: "workspace",
      priority: SNAP_PRIORITY.workspace,
    },
  ],
  axisConfig
);
assertCase(
  "d59.engine.axisThresholds",
  axisX.x === 115 && axisY.y === 100,
  "axisThresholdX allows 15px; axisThresholdY rejects 10px"
);

const disabled = applyMagneticSnap(geometry, targetsWorkspace, {
  ...config,
  enabled: false,
});
assertCase(
  "d59.engine.disabledNoop",
  disabled.x === 100 && disabled !== geometry,
  "enabled:false returns clone without snap"
);

const typesSource = readFileSync(typesPath, "utf8");
assertCase(
  "d59.engine.priorityConstants",
  /workspace:\s*0/.test(typesSource) &&
    /window:\s*1/.test(typesSource) &&
    /dock:\s*2/.test(typesSource),
  "SNAP_PRIORITY Workspace=0 > Window=1 > Dock=2"
);

const resizeSource = readFileSync(resizePath, "utf8");
assertCase(
  "d59.engine.rejectSnapViolatesConstraints",
  /acceptSnapAxes/.test(resizeSource) &&
    /satisfiesGeometryConstraints/.test(resizeSource) &&
    /isInsideWorkspace/.test(resizeSource),
  "ResizeBridge rejects snap axis that violates constraints/workspace"
);

const failed = results.filter((r) => !r.pass);
const summary = {
  phase: "d59-engine",
  pass: failed.length === 0,
  total: results.length,
  passed: results.length - failed.length,
  failed: failed.map((f) => f.id),
  results,
};

console.log(JSON.stringify(summary, null, 2));
console.log(
  summary.pass
    ? "\nPASS — d59-engine"
    : `\nFAIL — d59-engine (${failed.map((f) => f.id).join(", ")})`
);
process.exit(summary.pass ? 0 : 1);
