/**
 * D64.2 — Production Stabilization · aggregated API Freeze validation.
 *
 * Reuses existing phase API validators — does NOT redefine contracts.
 * Also checks D64.0 public barrel inventory presence + windows leak fence.
 *
 * Authority: docs/D64.0-production-baseline.md · API Freeze D45–D63.
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  createCaseRecorder,
  emitGateSummary,
  getRepoRoot,
  runNpmScriptGate,
  type SubGateSummary,
} from "./lib/methodology-gate-utils";

const repoRoot = getRepoRoot(import.meta.url);
const { results, assertCase } = createCaseRecorder();

/** Existing API Freeze / public API validators (D53–D63) — contracts unchanged. */
const API_FREEZE_SCRIPTS: { npmScript: string; gateId: string }[] = [
  { npmScript: "validate:d53-api-freeze", gateId: "d53-api-freeze" },
  { npmScript: "validate:d54-api-freeze", gateId: "d54-api-freeze" },
  { npmScript: "validate:d55-window-api", gateId: "d55-window-api" },
  { npmScript: "validate:d56-floating-api", gateId: "d56-floating-api" },
  { npmScript: "validate:d57-drag-api", gateId: "d57-drag-api" },
  { npmScript: "validate:d58-resize-api", gateId: "d58-resize-api" },
  { npmScript: "validate:d59-snap-api", gateId: "d59-snap-api" },
  { npmScript: "validate:d60-series-api", gateId: "d60-series-api" },
  { npmScript: "validate:d61-tabs-api", gateId: "d61-tabs-api" },
  { npmScript: "validate:d62-tabs-api", gateId: "d62-tabs-api" },
  { npmScript: "validate:d63-content-api", gateId: "d63-content-api" },
];

/** D64.0 §5 Public Barrel Snapshot — paths that must exist. */
const D64_0_BARRELS = [
  "src/lib/ui/index.ts",
  "src/components/ui/buttons/index.ts",
  "src/components/ui/layout/index.ts",
  "src/components/ui/sidebar/index.ts",
  "src/components/workspace/index.ts",
  "src/components/toolbar/index.ts",
  "src/components/inspector/index.ts",
  "src/components/docking/index.ts",
  "src/components/layout-engine/index.ts",
  "src/components/windows/index.ts",
  "src/components/windows/series/index.ts",
  "src/components/windows/tabs/index.ts",
  "src/components/windows/tab-ui/index.ts",
  "src/components/windows/content/index.ts",
] as const;

/** Representative public symbols from D64.0 §4 — presence-only (no contract rewrite). */
const D64_0_REQUIRED_EXPORTS: { barrel: string; symbols: string[] }[] = [
  {
    barrel: "src/components/workspace/index.ts",
    symbols: [
      "WorkspaceLayout",
      "WorkspaceContent",
      "WorkspacePanels",
      "WORKSPACE_TOKENS",
    ],
  },
  {
    barrel: "src/components/toolbar/index.ts",
    symbols: ["AdaptiveToolbar", "TOOLBAR_TOKENS"],
  },
  {
    barrel: "src/components/inspector/index.ts",
    symbols: ["Inspector", "INSPECTOR_TOKENS"],
  },
  {
    barrel: "src/components/docking/index.ts",
    symbols: [
      "DockRoot",
      "DockZone",
      "DockPanel",
      "DOCK_REGISTRY",
      "DockInteractionProvider",
    ],
  },
  {
    barrel: "src/components/layout-engine/index.ts",
    symbols: ["LayoutEngine", "LayoutRegion", "LayoutVisibility"],
  },
  {
    barrel: "src/components/windows/index.ts",
    symbols: [
      "WindowDefinition",
      "WindowAPI",
      "createWindowRegistry",
      "WindowProvider",
      "WindowManager",
      "FloatingWindow",
      "FloatingWindowLayer",
      "FloatingWindowBridge",
    ],
  },
  {
    barrel: "src/components/windows/series/index.ts",
    symbols: [
      "createSeriesRegistry",
      "createSeriesSelectionBridge",
      "createWindowSeriesBridge",
    ],
  },
  {
    barrel: "src/components/windows/tabs/index.ts",
    symbols: [
      "createTabRegistry",
      "createTabSelectionBridge",
      "OpaqueContentHandle",
      "createTabDocumentSwitch",
    ],
  },
  {
    barrel: "src/components/windows/tab-ui/index.ts",
    symbols: ["TabStrip", "TabBar", "TabDocumentHost"],
  },
  {
    barrel: "src/components/windows/content/index.ts",
    symbols: [
      "ContentDefinition",
      "createContentRegistry",
      "createContentBridge",
      "createTabSeriesBridge",
      "ContentHost",
    ],
  },
];

const read = (relPath: string): string => {
  const full = join(repoRoot, relPath);
  return existsSync(full) ? readFileSync(full, "utf8") : "";
};

const hasExportSymbol = (source: string, symbol: string): boolean => {
  if (!source) return false;
  if (new RegExp(`\\b${symbol}\\b`).test(source)) return true;
  // Covered by `export * from "./Module"` when Module name matches symbol file stem.
  return false;
};

// —— 1. Aggregate existing API Freeze validators ——

const subGates: SubGateSummary[] = API_FREEZE_SCRIPTS.map(({ npmScript, gateId }) =>
  runNpmScriptGate(repoRoot, npmScript, gateId)
);

for (const gate of subGates) {
  assertCase(
    `apiFreeze.subgate.${gate.gate}`,
    gate.pass,
    `exitCode=${gate.exitCode ?? "null"}`
  );
}

assertCase(
  "apiFreeze.subgates.executed",
  subGates.length === API_FREEZE_SCRIPTS.length,
  `expected=${API_FREEZE_SCRIPTS.length}, actual=${subGates.length}`
);

// —— 2. D64.0 barrel inventory — paths exist ——

for (const barrel of D64_0_BARRELS) {
  assertCase(
    `apiFreeze.barrel.exists.${barrel.replace(/\//g, ".")}`,
    existsSync(join(repoRoot, barrel)),
    barrel
  );
}

// —— 3. D64.0 representative public exports — presence ——

for (const { barrel, symbols } of D64_0_REQUIRED_EXPORTS) {
  const source = read(barrel);
  for (const symbol of symbols) {
    assertCase(
      `apiFreeze.export.${barrel.split("/").slice(-2, -1)[0] || "root"}.${symbol}`,
      hasExportSymbol(source, symbol),
      `${barrel} · ${symbol}`
    );
  }
}

// —— 4. Leak fence — windows public barrel must not re-export internal packages ——

const windowsBarrel = read("src/components/windows/index.ts");
const leakPatterns: { id: string; pattern: RegExp }[] = [
  { id: "series", pattern: /from\s+["']\.\/series["']/ },
  { id: "tabs", pattern: /from\s+["']\.\/tabs["']/ },
  { id: "tab-ui", pattern: /from\s+["']\.\/tab-ui["']/ },
  { id: "content", pattern: /from\s+["']\.\/content["']/ },
];

for (const { id, pattern } of leakPatterns) {
  assertCase(
    `apiFreeze.leakFence.windows.no-${id}`,
    !pattern.test(windowsBarrel),
    `windows/index.ts must not re-export ${id}/`
  );
}

// —— 5. Content barrel must not export ContentIntegration (D63 / D64.0) ——

const contentBarrel = read("src/components/windows/content/index.ts");
assertCase(
  "apiFreeze.leakFence.content.no-ContentIntegration",
  !/\bContentIntegration\b/.test(contentBarrel),
  "content/index.ts must not export ContentIntegration"
);

// —— Rollup ——

const allSubPass = subGates.every((g) => g.pass);
const inventoryPass = results
  .filter((r) => !r.id.startsWith("apiFreeze.subgate"))
  .every((r) => r.pass);
const allPass = results.every((r) => r.pass);

const rollup = {
  phase: "api-freeze",
  authority: "docs/D64.0-production-baseline.md",
  subGates: Object.fromEntries(
    subGates.map((g) => [g.gate, { pass: g.pass, exitCode: g.exitCode ?? null }])
  ),
  inventory: {
    barrels: D64_0_BARRELS.length,
    leakFence: "windows + content Integration ban",
  },
  subGatesPass: allSubPass,
  inventoryPass,
  final: allPass ? "API FREEZE PASS" : "API FREEZE FAIL",
};

console.log(JSON.stringify(rollup, null, 2));
console.log(allPass ? "\nAPI FREEZE PASS" : "\nAPI FREEZE FAIL");

emitGateSummary("api-freeze", results);
