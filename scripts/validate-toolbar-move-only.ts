/**
 * D49.4 — Toolbar move-only wiring gate.
 * Verifies same visual/interactive ownership contracts after D49.3 wiring.
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const repoRoot = process.cwd();
const pagePath = join(repoRoot, "src/app/page.tsx");
const toolbarDir = join(repoRoot, "src/components/toolbar");

const results: { id: string; pass: boolean; detail: string }[] = [];

const assertCase = (id: string, pass: boolean, detail: string) => {
  results.push({ id, pass, detail });
};

const readToolbarFile = (file: string): string => {
  const full = join(toolbarDir, file);
  return existsSync(full) ? readFileSync(full, "utf8") : "";
};

const pageSource = existsSync(pagePath) ? readFileSync(pagePath, "utf8") : "";
const adaptiveSource = readToolbarFile("AdaptiveToolbar.tsx");
const allToolbarSources = [
  "AdaptiveToolbar.tsx",
  "ToolbarSection.tsx",
  "ToolbarGroup.tsx",
  "ToolbarAction.tsx",
  "ToolbarOverflow.tsx",
  "ToolbarTokens.ts",
  "types.ts",
  "index.ts",
]
  .map(readToolbarFile)
  .join("\n");

// --- A. page mounts AdaptiveToolbar via barrel ---
assertCase(
  "move.page.imports.toolbar.barrel",
  /from\s+["']@\/components\/toolbar["']/.test(pageSource),
  'from "@/components/toolbar"'
);

assertCase(
  "move.page.no.deep.toolbar.imports",
  !/from\s+["']@\/components\/toolbar\//.test(pageSource),
  "no @/components/toolbar/* deep imports"
);

assertCase(
  "move.page.mounts.AdaptiveToolbar",
  /<AdaptiveToolbar[\s>]/.test(pageSource),
  "<AdaptiveToolbar"
);

assertCase(
  "move.page.import.AdaptiveToolbar.only",
  /import\s*\{\s*AdaptiveToolbar\s*\}\s*from\s*["']@\/components\/toolbar["']/.test(
    pageSource
  ),
  "import { AdaptiveToolbar } from barrel"
);

// --- B. left only; no center/right in wiring ---
assertCase(
  "move.page.uses.left",
  /<AdaptiveToolbar[\s\S]*?\bleft\s*=/.test(pageSource),
  "AdaptiveToolbar left= present"
);

assertCase(
  "move.page.no.center.prop",
  !/<AdaptiveToolbar[\s\S]*?\bcenter\s*=/.test(pageSource),
  "center prop not used in page wiring"
);

assertCase(
  "move.page.no.right.prop",
  !/<AdaptiveToolbar[\s\S]*?\bright\s*=/.test(pageSource),
  "right prop not used in page wiring"
);

// --- C. infra components not used in page ---
assertCase(
  "move.page.no.ToolbarGroup",
  !/\bToolbarGroup\b/.test(pageSource),
  "ToolbarGroup not referenced in page.tsx"
);

assertCase(
  "move.page.no.ToolbarAction",
  !/\bToolbarAction\b/.test(pageSource),
  "ToolbarAction not referenced in page.tsx"
);

assertCase(
  "move.page.no.ToolbarOverflow",
  !/\bToolbarOverflow\b/.test(pageSource),
  "ToolbarOverflow not referenced in page.tsx"
);

// --- D. ownership: page still owns chrome children + handlers ---
assertCase(
  "move.ownership.WorkspaceTab.in.page",
  /function\s+WorkspaceTab\b/.test(pageSource) &&
    /<WorkspaceTab[\s>]/.test(pageSource),
  "WorkspaceTab defined and composed in page.tsx"
);

assertCase(
  "move.ownership.WorkflowSessionIndicator.in.page",
  /<WorkflowSessionIndicator[\s>]/.test(pageSource),
  "WorkflowSessionIndicator composed in page.tsx"
);

assertCase(
  "move.ownership.LabUsageProfileSelector.in.page",
  /<LabUsageProfileSelector[\s>]/.test(pageSource),
  "LabUsageProfileSelector composed in page.tsx"
);

assertCase(
  "move.handlers.selectWorkspaceSection",
  /\bselectWorkspaceSection\b/.test(pageSource) &&
    /onSelect=\{selectWorkspaceSection\}/.test(pageSource),
  "selectWorkspaceSection wired in page"
);

assertCase(
  "move.handlers.cancelGuidedWorkflow",
  /\bcancelGuidedWorkflow\b/.test(pageSource) &&
    /onCancel=\{cancelGuidedWorkflow\}/.test(pageSource),
  "cancelGuidedWorkflow wired in page"
);

assertCase(
  "move.handlers.setLabUsageProfile",
  /\bsetLabUsageProfile\b/.test(pageSource) &&
    /onChange=\{setLabUsageProfile\}/.test(pageSource),
  "setLabUsageProfile wired in page"
);

// --- E. AdaptiveToolbar / toolbar module never imports owned children ---
const ownershipBanNames = [
  "WorkspaceTab",
  "WorkflowSessionIndicator",
  "LabUsageProfileSelector",
] as const;

for (const name of ownershipBanNames) {
  const importHit =
    new RegExp(`import\\s+[\\s\\S]*?\\b${name}\\b`).test(allToolbarSources) ||
    new RegExp(`from\\s+["'][^"']*${name}[^"']*["']`).test(allToolbarSources) ||
    new RegExp(`\\b${name}\\b`).test(
      allToolbarSources
        .split(/\r?\n/)
        .filter((line) => /^\s*import\s/.test(line))
        .join("\n")
    );

  assertCase(
    `move.ownership.ban.${name}`,
    !importHit && !new RegExp(`\\b${name}\\b`).test(adaptiveSource),
    `${name} not imported/referenced by AdaptiveToolbar / toolbar imports`
  );
}

// Interactive tree markers still inside AdaptiveToolbar left slot region
const toolbarBlockMatch = pageSource.match(
  /toolbar=\{\s*<AdaptiveToolbar[\s\S]*?\/>\s*\}/
);
const toolbarBlock = toolbarBlockMatch?.[0] ?? "";

assertCase(
  "move.visual.tree.order.markers",
  toolbarBlock.includes("<header") &&
    toolbarBlock.includes('role="tablist"') &&
    toolbarBlock.includes("<WorkspaceTab") &&
    toolbarBlock.includes("<LabUsageProfileSelector"),
  "header → nav/tabs → LabUsage present inside AdaptiveToolbar wiring"
);

assertCase(
  "toolbar.moveOnly",
  results
    .filter((r) => r.id.startsWith("move."))
    .every((r) => r.pass),
  "aggregate move-only wiring + ownership"
);

const failed = results.filter((r) => !r.pass);
const summary = {
  phase: "toolbar-move-only",
  pass: failed.length === 0,
  total: results.length,
  passed: results.length - failed.length,
  failed: failed.map((f) => f.id),
  results,
};

console.log(JSON.stringify(summary, null, 2));
console.log(
  summary.pass
    ? "\nPASS — toolbar-move-only"
    : `\nFAIL — toolbar-move-only (${failed.map((f) => f.id).join(", ")})`
);
process.exit(summary.pass ? 0 : 1);
