/**
 * D61.10 — Window Tabs Foundation · governance gate.
 * Authority: docs/D61.0-tabs-discovery.md · Hard Rules + Governance Freeze.
 */
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const repoRoot = process.cwd();
const tabsDir = join(repoRoot, "src/components/windows/tabs");

const results: { id: string; pass: boolean; detail: string }[] = [];
const assertCase = (id: string, pass: boolean, detail: string) => {
  results.push({ id, pass, detail });
};

const stripComments = (source: string): string =>
  source
    .replace(/\/\*[\s\S]*?\*\//g, " ")
    .replace(/\/\/.*$/gm, " ");

const tabsFiles = existsSync(tabsDir)
  ? readdirSync(tabsDir).filter((f) => f.endsWith(".ts") || f.endsWith(".tsx"))
  : [];

assertCase(
  "d61.gov.tabsDirExists",
  existsSync(tabsDir),
  existsSync(tabsDir) ? "tabs/ exists" : "tabs/ missing"
);

assertCase(
  "d61.gov.noTsx",
  tabsFiles.every((f) => f.endsWith(".ts") && !f.endsWith(".tsx")),
  tabsFiles.some((f) => f.endsWith(".tsx"))
    ? `tsx present: ${tabsFiles.filter((f) => f.endsWith(".tsx")).join(",")}`
    : "no .tsx in tabs/"
);

const sources = tabsFiles.map((file) => ({
  file,
  raw: readFileSync(join(tabsDir, file), "utf8"),
  code: stripComments(readFileSync(join(tabsDir, file), "utf8")),
}));

const allRaw = sources.map((s) => s.raw).join("\n");
const allCode = sources.map((s) => s.code).join("\n");

assertCase(
  "d61.gov.noReact",
  !/\bfrom\s+["']react["']/.test(allRaw) &&
    !/\bfrom\s+["']react\//.test(allRaw) &&
    !/\bReact\b/.test(allCode),
  "No React imports / React symbol"
);

assertCase(
  "d61.gov.noJsx",
  !/<\/[A-Z]/.test(allCode) &&
    !/React\.createElement/.test(allCode) &&
    !/<[A-Z][A-Za-z0-9]*\s+[A-Za-z]/.test(allCode) &&
    !/<[A-Z][A-Za-z0-9]*\s*\/>/.test(allCode),
  "No JSX (TS generics excluded)"
);

assertCase(
  "d61.gov.noHooks",
  !/\buse(State|Effect|Ref|Memo|Callback|Context|Reducer|Id|SyncExternalStore)\s*\(/.test(
    allCode
  ) && !/\bhooks\b/i.test(allCode),
  "No hooks"
);

assertCase(
  "d61.gov.noContext",
  !/\bcreateContext\b/.test(allCode) &&
    !/\buseContext\b/.test(allCode) &&
    !/\bContext\b/.test(allCode) &&
    !/\bProvider\b/.test(allCode),
  "No Context / Provider"
);

assertCase(
  "d61.gov.noDom",
  !/\bdocument\b/.test(allCode) &&
    !/\bHTMLElement\b/.test(allCode) &&
    !/\baddEventListener\b/.test(allCode) &&
    !/\bDOM\b/.test(allCode) &&
    !/\bglobalThis\.window\b/.test(allCode) &&
    !/(?<![A-Za-z])window\.(?!Id|To|Tabs)/.test(allCode),
  "No DOM (WindowId identifiers allowed)"
);

assertCase(
  "d61.gov.noCss",
  !/\.css["']/.test(allCode) &&
    !/\bclassName\b/.test(allCode) &&
    !/\bstyle\s*[:=]/.test(allCode) &&
    !/\bCSS\b/.test(allCode),
  "No CSS"
);

assertCase(
  "d61.gov.noWindowDefinition",
  !/\bWindowDefinition\b/.test(allCode),
  "No WindowDefinition references"
);

assertCase(
  "d61.gov.noWindowState",
  !/\bWindowState\b/.test(allCode),
  "No WindowState references"
);

const BANNED_WORDS: { id: string; pattern: RegExp; label: string }[] = [
  { id: "graph", pattern: /\bgraph\b/i, label: "graph" },
  { id: "chart", pattern: /\bchart\b/i, label: "chart" },
  { id: "dataset", pattern: /\bdataset\b/i, label: "dataset" },
  { id: "analysis", pattern: /\banalysis\b/i, label: "analysis" },
  { id: "math", pattern: /\bmath\b/i, label: "math" },
  { id: "scientific", pattern: /\bscientific\b/i, label: "scientific" },
];

for (const ban of BANNED_WORDS) {
  assertCase(
    `d61.gov.no-${ban.id}`,
    !ban.pattern.test(allCode),
    ban.pattern.test(allCode) ? `${ban.label} found` : `no ${ban.label}`
  );
}

assertCase(
  "d61.gov.noWindowManagerImport",
  !/from\s+["'][^"']*WindowManager[^"']*["']/.test(allRaw) &&
    !/\bWindowManager\b/.test(allCode),
  "No WindowManager"
);

assertCase(
  "d61.gov.noPageImport",
  !/from\s+["'][^"']*page["']/.test(allRaw) && !/page\.tsx/.test(allRaw),
  "No page.tsx imports"
);

assertCase(
  "d61.gov.noDockLayoutImports",
  !/from\s+["'][^"']*docking[^"']*["']/.test(allRaw) &&
    !/from\s+["'][^"']*layout-engine[^"']*["']/.test(allRaw) &&
    !/from\s+["'][^"']*\/dock[^"']*["']/i.test(allRaw),
  "No Dock / Layout Engine imports"
);

assertCase(
  "d61.gov.noFloatingDragResizeSnapImports",
  !/from\s+["'][^"']*Floating[^"']*["']/.test(allRaw) &&
    !/from\s+["'][^"']*WindowDrag[^"']*["']/.test(allRaw) &&
    !/from\s+["'][^"']*WindowResize[^"']*["']/.test(allRaw) &&
    !/from\s+["'][^"']*WindowSnap[^"']*["']/.test(allRaw),
  "No Floating / Drag / Resize / Snap imports"
);

assertCase(
  "d61.gov.noUiImports",
  !/from\s+["'][^"']*components\/ui[^"']*["']/.test(allRaw) &&
    !/from\s+["']@\/components\/ui/.test(allRaw),
  "No UI component imports"
);

assertCase(
  "d61.gov.noExternalDomainImports",
  !/from\s+["'][^"']*lib\/graph[^"']*["']/.test(allRaw) &&
    !/from\s+["'][^"']*lib\/scientific[^"']*["']/.test(allRaw) &&
    !/from\s+["'][^"']*lib\/project[^"']*["']/.test(allRaw),
  "No domain module imports"
);

assertCase(
  "d61.gov.decoupledFromWindowSurfaces",
  !/from\s+["']\.\.\/WindowTypes["']/.test(allRaw) &&
    !/from\s+["']\.\.\/WindowRegistry["']/.test(allRaw) &&
    !/from\s+["']\.\.\/WindowManager["']/.test(allRaw) &&
    !/from\s+["']\.\.\/WindowGeometryState["']/.test(allRaw),
  "tabs/** does not import Window* authorities"
);

assertCase(
  "d61.gov.noSeriesRegistryImport",
  !/from\s+["'][^"']*SeriesRegistry[^"']*["']/.test(allRaw) &&
    !/from\s+["']\.\/\.\.\/series/.test(allRaw) &&
    !/from\s+["']\.\.\/series/.test(allRaw),
  "No SeriesRegistry / series/ imports"
);

const failed = results.filter((r) => !r.pass);
const summary = {
  phase: "d61-governance",
  pass: failed.length === 0,
  total: results.length,
  passed: results.length - failed.length,
  failed: failed.map((f) => f.id),
  results,
};

console.log(JSON.stringify(summary, null, 2));
console.log(
  summary.pass
    ? "\nPASS — d61-governance"
    : `\nFAIL — d61-governance (${failed.map((f) => f.id).join(", ")})`
);
process.exit(summary.pass ? 0 : 1);
