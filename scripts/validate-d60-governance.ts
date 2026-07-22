/**
 * D60.5 — Series Alignment Foundation · governance gate.
 * Authority: docs/D60.0-series-discovery.md · Hard Rules + Governance Freeze.
 */
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const repoRoot = process.cwd();
const seriesDir = join(repoRoot, "src/components/windows/series");

const results: { id: string; pass: boolean; detail: string }[] = [];
const assertCase = (id: string, pass: boolean, detail: string) => {
  results.push({ id, pass, detail });
};

const stripComments = (source: string): string =>
  source
    .replace(/\/\*[\s\S]*?\*\//g, " ")
    .replace(/\/\/.*$/gm, " ");

const seriesFiles = existsSync(seriesDir)
  ? readdirSync(seriesDir).filter((f) => f.endsWith(".ts") || f.endsWith(".tsx"))
  : [];

assertCase(
  "d60.gov.seriesDirExists",
  existsSync(seriesDir),
  existsSync(seriesDir) ? "series/ exists" : "series/ missing"
);

assertCase(
  "d60.gov.noTsx",
  seriesFiles.every((f) => f.endsWith(".ts") && !f.endsWith(".tsx")),
  seriesFiles.some((f) => f.endsWith(".tsx"))
    ? `tsx present: ${seriesFiles.filter((f) => f.endsWith(".tsx")).join(",")}`
    : "no .tsx in series/"
);

const sources = seriesFiles.map((file) => ({
  file,
  raw: readFileSync(join(seriesDir, file), "utf8"),
  code: stripComments(readFileSync(join(seriesDir, file), "utf8")),
}));

const allRaw = sources.map((s) => s.raw).join("\n");
const allCode = sources.map((s) => s.code).join("\n");

assertCase(
  "d60.gov.noReact",
  !/\bfrom\s+["']react["']/.test(allRaw) &&
    !/\bfrom\s+["']react\//.test(allRaw) &&
    !/\bReact\b/.test(allCode),
  "No React imports / React symbol"
);

assertCase(
  "d60.gov.noJsx",
  !/<\/[A-Z]/.test(allCode) &&
    !/React\.createElement/.test(allCode) &&
    !/<[A-Z][A-Za-z0-9]*\s+[A-Za-z]/.test(allCode) &&
    !/<[A-Z][A-Za-z0-9]*\s*\/>/.test(allCode),
  "No JSX (TS generics excluded)"
);

assertCase(
  "d60.gov.noHooks",
  !/\buse(State|Effect|Ref|Memo|Callback|Context|Reducer|Id|SyncExternalStore)\s*\(/.test(
    allCode
  ) && !/\bhooks\b/i.test(allCode),
  "No hooks"
);

assertCase(
  "d60.gov.noContext",
  !/\bcreateContext\b/.test(allCode) &&
    !/\buseContext\b/.test(allCode) &&
    !/\bContext\b/.test(allCode) &&
    !/\bProvider\b/.test(allCode),
  "No Context / Provider"
);

assertCase(
  "d60.gov.noDom",
  !/\bdocument\b/.test(allCode) &&
    !/\bwindow\b/.test(allCode) &&
    !/\bHTMLElement\b/.test(allCode) &&
    !/\baddEventListener\b/.test(allCode) &&
    !/\bDOM\b/.test(allCode),
  "No DOM"
);

assertCase(
  "d60.gov.noCss",
  !/\.css["']/.test(allCode) &&
    !/\bclassName\b/.test(allCode) &&
    !/\bstyle\s*[:=]/.test(allCode) &&
    !/\bCSS\b/.test(allCode),
  "No CSS"
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
    `d60.gov.no-${ban.id}`,
    !ban.pattern.test(allCode),
    ban.pattern.test(allCode) ? `${ban.label} found` : `no ${ban.label}`
  );
}

assertCase(
  "d60.gov.noWindowManagerImport",
  !/from\s+["'][^"']*WindowManager[^"']*["']/.test(allRaw) &&
    !/\bWindowManager\b/.test(allCode),
  "No WindowManager"
);

assertCase(
  "d60.gov.noPageImport",
  !/from\s+["'][^"']*page["']/.test(allRaw) &&
    !/page\.tsx/.test(allRaw),
  "No page.tsx imports"
);

assertCase(
  "d60.gov.noDockLayoutImports",
  !/from\s+["'][^"']*docking[^"']*["']/.test(allRaw) &&
    !/from\s+["'][^"']*layout-engine[^"']*["']/.test(allRaw) &&
    !/from\s+["'][^"']*\/dock[^"']*["']/i.test(allRaw),
  "No Dock / Layout Engine imports"
);

assertCase(
  "d60.gov.noUiImports",
  !/from\s+["'][^"']*components\/ui[^"']*["']/.test(allRaw) &&
    !/from\s+["']@\/components\/ui/.test(allRaw),
  "No UI component imports"
);

assertCase(
  "d60.gov.noExternalDomainImports",
  !/from\s+["'][^"']*lib\/graph[^"']*["']/.test(allRaw) &&
    !/from\s+["'][^"']*lib\/scientific[^"']*["']/.test(allRaw) &&
    !/from\s+["'][^"']*lib\/project[^"']*["']/.test(allRaw),
  "No domain module imports"
);

assertCase(
  "d60.gov.decoupledFromWindowSurfaces",
  !/from\s+["']\.\.\/WindowTypes["']/.test(allRaw) &&
    !/from\s+["']\.\.\/WindowRegistry["']/.test(allRaw) &&
    !/from\s+["']\.\.\/WindowManager["']/.test(allRaw) &&
    !/from\s+["']\.\.\/WindowGeometryState["']/.test(allRaw),
  "series/** does not import Window* authorities"
);

const failed = results.filter((r) => !r.pass);
const summary = {
  phase: "d60-governance",
  pass: failed.length === 0,
  total: results.length,
  passed: results.length - failed.length,
  failed: failed.map((f) => f.id),
  results,
};

console.log(JSON.stringify(summary, null, 2));
console.log(
  summary.pass
    ? "\nPASS — d60-governance"
    : `\nFAIL — d60-governance (${failed.map((f) => f.id).join(", ")})`
);
process.exit(summary.pass ? 0 : 1);
