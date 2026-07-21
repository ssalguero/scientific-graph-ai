/**
 * D58.4 — Window Resize System · boundaries / constraints gate.
 * Authority: D58.0 Coordinate Space Freeze · D58.3 Geometry Constraints.
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const repoRoot = process.cwd();
const windowsDir = join(repoRoot, "src/components/windows");

const results: { id: string; pass: boolean; detail: string }[] = [];
const assertCase = (id: string, pass: boolean, detail: string) => {
  results.push({ id, pass, detail });
};

const stripComments = (source: string): string =>
  source
    .replace(/\/\*[\s\S]*?\*\//g, " ")
    .replace(/\/\/.*$/gm, " ");

const read = (file: string): string => {
  const full = join(windowsDir, file);
  return existsSync(full) ? readFileSync(full, "utf8") : "";
};

const constraints = read("WindowGeometryConstraints.ts");
const constraintsCode = stripComments(constraints);
const resizeBridge = stripComments(read("WindowResizeBridge.ts"));
const dragBridge = stripComments(read("WindowDragBridge.ts"));
const floatingWindow = stripComments(read("FloatingWindow.tsx"));
const joined =
  constraintsCode + resizeBridge + dragBridge + floatingWindow;

assertCase(
  "d58.boundaries.fileExists",
  existsSync(join(windowsDir, "WindowGeometryConstraints.ts")),
  "WindowGeometryConstraints.ts exists"
);

assertCase(
  "d58.boundaries.geometryConstraints",
  /export type GeometryConstraints\s*=/.test(constraints) &&
    /minWidth:\s*number/.test(constraints) &&
    /minHeight:\s*number/.test(constraints) &&
    /maxWidth\?:/.test(constraints) &&
    /maxHeight\?:/.test(constraints) &&
    /applyGeometryConstraints/.test(constraintsCode),
  "GeometryConstraints present with apply helper"
);

assertCase(
  "d58.boundaries.workspaceConstraints",
  /export type WorkspaceConstraints\s*=/.test(constraints) &&
    /left:\s*number/.test(constraints) &&
    /top:\s*number/.test(constraints) &&
    /right:\s*number/.test(constraints) &&
    /bottom:\s*number/.test(constraints) &&
    /applyWorkspaceConstraints/.test(constraintsCode),
  "WorkspaceConstraints present with apply helper"
);

assertCase(
  "d58.boundaries.pipeline",
  /applyConstraintPipeline/.test(constraintsCode) &&
    /applyConstraintPipeline/.test(resizeBridge) &&
    /computeResizedGeometry/.test(resizeBridge),
  "Constraint pipeline wired: Math → Constraints → GeometryState"
);

assertCase(
  "d58.boundaries.pipelineOrderDocumented",
  /GeometryConstraints/.test(constraints) &&
    /WorkspaceConstraints/.test(constraints) &&
    /applyGeometryConstraints[\s\S]*applyWorkspaceConstraints/.test(
      constraintsCode
    ),
  "Pipeline order Geometry then Workspace in applyConstraintPipeline"
);

assertCase(
  "d58.boundaries.noViewportTransforms",
  !/\bviewport\b/i.test(joined) ||
    !/viewportTransform|scrollX|scrollY|pageXOffset/i.test(joined),
  "No viewport transform math in resize/constraints path"
);

assertCase(
  "d58.boundaries.noScrollCompensation",
  !/scrollCompensation/i.test(joined) &&
    !/scrollLeft|scrollTop|window\.scroll/i.test(joined),
  "No scroll compensation"
);

assertCase(
  "d58.boundaries.noDevicePixelRatio",
  !/devicePixelRatio/i.test(joined),
  "No devicePixelRatio assumptions"
);

assertCase(
  "d58.boundaries.noZoomMath",
  !/\bzoom\b/i.test(joined) && !/scaleX|scaleY|CSSMatrix/i.test(joined),
  "No zoom math"
);

assertCase(
  "d58.boundaries.noDomGeometry",
  !/getBoundingClientRect/.test(joined) &&
    !/offsetWidth|offsetHeight|clientWidth|clientHeight/.test(joined),
  "No DOM geometry measurements"
);

const failed = results.filter((r) => !r.pass);
const summary = {
  phase: "d58-boundaries",
  pass: failed.length === 0,
  total: results.length,
  passed: results.length - failed.length,
  failed: failed.map((f) => f.id),
  results,
};

console.log(JSON.stringify(summary, null, 2));
console.log(
  summary.pass
    ? "\nPASS — d58-boundaries"
    : `\nFAIL — d58-boundaries (${failed.map((f) => f.id).join(", ")})`
);
process.exit(summary.pass ? 0 : 1);
