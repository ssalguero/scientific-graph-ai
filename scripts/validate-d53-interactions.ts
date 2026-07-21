/**
 * D53.5 — Dock Interactions infrastructure gate.
 */
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const repoRoot = process.cwd();
const dockingDir = join(repoRoot, "src/components/docking");

const results: { id: string; pass: boolean; detail: string }[] = [];
const assertCase = (id: string, pass: boolean, detail: string) => {
  results.push({ id, pass, detail });
};

const read = (file: string): string => {
  const full = join(dockingDir, file);
  return existsSync(full) ? readFileSync(full, "utf8") : "";
};

const dockingFiles = existsSync(dockingDir)
  ? readdirSync(dockingDir).filter((name) => !name.startsWith("."))
  : [];
const allSources = dockingFiles.map((name) => read(name)).join("\n");
const interactionSource = read("DockInteractionContext.tsx");
const providerSource = read("DockInteractionProvider.tsx");
const rootSource = read("DockRoot.tsx");
const panelSource = read("DockPanel.tsx");
const dragHookSource = read("useDockDrag.ts");
const resizeHookSource = read("useDockResize.ts");

assertCase(
  "d53.ix.providerExists",
  /export function DockInteractionProvider/.test(providerSource),
  "provider"
);

assertCase(
  "d53.ix.contextExists",
  /export const DockInteractionContext/.test(interactionSource),
  "context"
);

assertCase(
  "d53.ix.hooksExist",
  existsSync(join(dockingDir, "useDockInteraction.ts")) &&
    existsSync(join(dockingDir, "useDockDrag.ts")) &&
    existsSync(join(dockingDir, "useDockResize.ts")),
  "hooks"
);

const stateFields = [
  "focusedDock",
  "activeDock",
  "hoverDock",
  "draggingDock",
  "resizingDock",
  "dragSession",
  "resizeSession",
] as const;

for (const field of stateFields) {
  assertCase(
    `d53.ix.state.${field}`,
    new RegExp(`\\b${field}\\b`).test(interactionSource) &&
      new RegExp(`\\b${field}\\b`).test(providerSource),
    field
  );
}

assertCase(
  "d53.ix.providerNested",
  /<DockProvider>/.test(rootSource) &&
    /<DockInteractionProvider>/.test(rootSource) &&
    rootSource.indexOf("DockProvider") <
      rootSource.indexOf("DockInteractionProvider"),
  "DockRoot nests DockProvider → DockInteractionProvider"
);

assertCase(
  "d53.ix.focusApi",
  /\bfocus\b/.test(providerSource) &&
    /\bblur\b/.test(providerSource) &&
    /\bactivate\b/.test(providerSource) &&
    /\bdeactivate\b/.test(providerSource),
  "focus/activation API"
);

assertCase(
  "d53.ix.dragInfra",
  /beginDrag/.test(providerSource) &&
    /updateDrag/.test(providerSource) &&
    /endDrag/.test(providerSource) &&
    /useDockDrag/.test(dragHookSource),
  "drag session infra"
);

assertCase(
  "d53.ix.resizeInfra",
  /beginResize/.test(providerSource) &&
    /updateResize/.test(providerSource) &&
    /endResize/.test(providerSource) &&
    /useDockResize/.test(resizeHookSource),
  "resize session infra"
);

assertCase(
  "d53.ix.keyboardReady",
  /tabIndex=\{0\}/.test(panelSource) &&
    /aria-selected/.test(panelSource) &&
    /aria-current/.test(panelSource),
  "DockPanel keyboard-ready attrs"
);

const layoutMutationPatterns = [
  /\bsetSizes?\b/,
  /\bapplyLayout\b/,
  /\bsnapTo\b/,
  /\bcollision\b/,
  /\bmutateLayout\b/,
  /\bwriteLayout\b/,
  /DEFAULT_DOCK_LAYOUT\s*=/,
  /\bsizes\s*:\s*\{/,
];

const interactionFiles = [
  providerSource,
  interactionSource,
  dragHookSource,
  resizeHookSource,
  read("useDockInteraction.ts"),
].join("\n");

const layoutHits = layoutMutationPatterns.filter((re) =>
  re.test(interactionFiles)
);
assertCase(
  "d53.ix.noLayoutMutationHelpers",
  layoutHits.length === 0,
  layoutHits.length ? layoutHits.map(String).join(",") : "clean"
);

assertCase(
  "d53.ix.noFloatingImpl",
  !/\bfloatingWindow\b/i.test(allSources) &&
    !/\bopenFloating\b/.test(allSources) &&
    !/\bsnapDock\b/.test(allSources),
  "no floating/snap implementation"
);

assertCase(
  "d53.ix.noGlobalListeners",
  !/addEventListener\s*\(/.test(interactionFiles) &&
    !/window\.addEventListener/.test(interactionFiles) &&
    !/document\.addEventListener/.test(interactionFiles),
  "no global pointer listeners"
);

const failed = results.filter((r) => !r.pass);
const summary = {
  phase: "d53-interactions",
  pass: failed.length === 0,
  total: results.length,
  passed: results.length - failed.length,
  failed: failed.map((f) => f.id),
  results,
};

console.log(JSON.stringify(summary, null, 2));
console.log(
  summary.pass
    ? "\nPASS — d53-interactions"
    : `\nFAIL — d53-interactions (${failed.map((f) => f.id).join(", ")})`
);
process.exit(summary.pass ? 0 : 1);
