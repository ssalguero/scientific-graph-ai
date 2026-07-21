/**
 * D53.5 — Dock Interactions governance gate.
 */
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const repoRoot = process.cwd();
const dockingDir = join(repoRoot, "src/components/docking");
const pagePath = join(repoRoot, "src/app/page.tsx");

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
const allDockingSources = dockingFiles.map((name) => read(name)).join("\n");
const providerSource = read("DockInteractionProvider.tsx");
const interactionSource = read("DockInteractionContext.tsx");
const contextSource = read("DockContext.tsx");
const rootSource = read("DockRoot.tsx");
const dragHookSource = read("useDockDrag.ts");
const resizeHookSource = read("useDockResize.ts");
const useIxSource = read("useDockInteraction.ts");
const panelSource = read("DockPanel.tsx");
const pageSource = existsSync(pagePath) ? readFileSync(pagePath, "utf8") : "";

const interactionModuleSources = [
  providerSource,
  interactionSource,
  dragHookSource,
  resizeHookSource,
  useIxSource,
  panelSource,
].join("\n");

const FORBIDDEN_IMPORT_PATHS = [
  /@\/app\/page/,
  /@\/lib\/scientific/,
  /@\/lib\/graph/,
  /@\/components\/graph/,
  /@\/components\/analysis/,
  /from\s+["'][^"']*scientific[^"']*["']/,
  /from\s+["'][^"']*\/graph[^"']*["']/,
  /from\s+["'][^"']*analysis[^"']*["']/,
  /from\s+["'][^"']*statistics[^"']*["']/,
  /from\s+["'][^"']*\/math[^"']*["']/,
  /from\s+["'][^"']*export[^"']*["']/,
  /supabase/i,
];

const forbiddenHits: string[] = [];
for (const pattern of FORBIDDEN_IMPORT_PATHS) {
  if (pattern.test(allDockingSources)) {
    forbiddenHits.push(String(pattern));
  }
}
assertCase(
  "d53.gov.noScientificImports",
  forbiddenHits.length === 0,
  forbiddenHits.length ? forbiddenHits.join(",") : "clean"
);

assertCase(
  "d53.gov.noPageInteractionImports",
  !/useDockInteraction/.test(pageSource) &&
    !/useDockDrag/.test(pageSource) &&
    !/useDockResize/.test(pageSource) &&
    !/DockInteractionProvider/.test(pageSource) &&
    !/beginDrag/.test(pageSource) &&
    !/beginResize/.test(pageSource),
  "page.tsx does not import interaction API"
);

assertCase(
  "d53.gov.noTailwindNew",
  !/\bclassName\s*=/.test(interactionModuleSources),
  "no className / Tailwind on interaction modules"
);

assertCase(
  "d53.gov.noHardcodedColors",
  !/#[0-9a-fA-F]{3,8}\b/.test(interactionModuleSources) &&
    !/\brgb(a)?\s*\(/.test(interactionModuleSources),
  "no hex/rgb colors"
);

assertCase(
  "d53.gov.noCss",
  !/\.css["']/.test(interactionModuleSources) &&
    !/\bstyle\s*=\s*\{/.test(interactionModuleSources),
  "no CSS imports / inline style"
);

assertCase(
  "d53.gov.oneWayNesting",
  !/from\s+["']\.\/DockContext["']/.test(providerSource) &&
    !/from\s+["']\.\/DockContext["']/.test(interactionSource) &&
    !/from\s+["']\.\/DockContext["']/.test(useIxSource) &&
    !/from\s+["']\.\/DockContext["']/.test(dragHookSource) &&
    !/from\s+["']\.\/DockContext["']/.test(resizeHookSource) &&
    !/import\s*\{[^}]*\bDockProvider\b[^}]*\}\s*from/.test(
      [providerSource, interactionSource, useIxSource, dragHookSource, resizeHookSource].join(
        "\n"
      )
    ),
  "DockInteractionProvider never imports DockProvider"
);

assertCase(
  "d53.gov.noReverseImport",
  !/DockInteraction/.test(contextSource) &&
    !/useDockInteraction/.test(contextSource) &&
    !/useDockDrag/.test(contextSource) &&
    !/useDockResize/.test(contextSource),
  "DockContext never imports interaction modules"
);

assertCase(
  "d53.gov.nestingInRoot",
  /<DockProvider>[\s\S]*<DockInteractionProvider>/.test(rootSource),
  "DockRoot one-way nesting"
);

assertCase(
  "d53.gov.contextIsolated",
  !/focusedDock|activeDock|hoverDock|draggingDock|resizingDock|dragSession|resizeSession/.test(
    read("types.ts")
  ),
  "interaction fields not merged into DockState types"
);

assertCase(
  "d53.gov.noCircular",
  !/from\s+["']\.\/DockInteractionProvider["']/.test(contextSource) &&
    !/from\s+["']\.\/DockContext["']/.test(providerSource),
  "no circular Provider ↔ Interaction"
);

const failed = results.filter((r) => !r.pass);
const summary = {
  phase: "d53-governance",
  pass: failed.length === 0,
  total: results.length,
  passed: results.length - failed.length,
  failed: failed.map((f) => f.id),
  results,
};

console.log(JSON.stringify(summary, null, 2));
console.log(
  summary.pass
    ? "\nPASS — d53-governance"
    : `\nFAIL — d53-governance (${failed.map((f) => f.id).join(", ")})`
);
process.exit(summary.pass ? 0 : 1);
