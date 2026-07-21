/**
 * D55.4 — Multi-Window Foundation governance gate.
 * Authority: docs/D55.1-multi-window-discovery.md §7 Governance.
 */
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const repoRoot = process.cwd();
const windowsDir = join(repoRoot, "src/components/windows");
const srcDir = join(repoRoot, "src");

const results: { id: string; pass: boolean; detail: string }[] = [];
const assertCase = (id: string, pass: boolean, detail: string) => {
  results.push({ id, pass, detail });
};

const stripComments = (source: string): string =>
  source
    .replace(/\/\*[\s\S]*?\*\//g, " ")
    .replace(/\/\/.*$/gm, " ");

const readWindowsSources = (): { files: string[]; joined: string; codeOnly: string } => {
  if (!existsSync(windowsDir)) {
    return { files: [], joined: "", codeOnly: "" };
  }
  const files = readdirSync(windowsDir).filter(
    (name) => /\.(ts|tsx)$/.test(name) && !name.startsWith(".")
  );
  const sources = files.map((name) =>
    readFileSync(join(windowsDir, name), "utf8")
  );
  const joined = sources.join("\n");
  return {
    files,
    joined,
    codeOnly: stripComments(joined),
  };
};

const walkTsFiles = (dir: string, out: string[] = []): string[] => {
  if (!existsSync(dir)) return out;
  for (const name of readdirSync(dir)) {
    if (name.startsWith(".")) continue;
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) {
      walkTsFiles(full, out);
    } else if (/\.(ts|tsx)$/.test(name)) {
      out.push(full);
    }
  }
  return out;
};

const { files, joined, codeOnly } = readWindowsSources();

assertCase(
  "d55.gov.moduleExists",
  files.length > 0,
  files.length ? `files=${files.join(",")}` : "missing windows module"
);

/** Forbidden import targets from windows module. */
const FORBIDDEN_IMPORT_PATTERNS: { id: string; pattern: RegExp }[] = [
  { id: "app", pattern: /from\s+["'][^"']*(?:@\/app\/|src\/app\/|@\/app["'])/ },
  { id: "workspace", pattern: /from\s+["'][^"']*workspace[^"']*["']/ },
  { id: "docking", pattern: /from\s+["'][^"']*docking[^"']*["']/ },
  { id: "layout-engine", pattern: /from\s+["'][^"']*layout-engine[^"']*["']/ },
  { id: "scientific", pattern: /from\s+["'][^"']*scientific[^"']*["']/ },
  { id: "graph", pattern: /from\s+["'][^"']*(?:\/graph\/|@\/components\/graph|@\/lib\/graph)[^"']*["']/ },
  { id: "analysis", pattern: /from\s+["'][^"']*analysis[^"']*["']/ },
  { id: "inspector", pattern: /from\s+["'][^"']*inspector[^"']*["']/ },
  { id: "sidebar", pattern: /from\s+["'][^"']*sidebar[^"']*["']/ },
  { id: "toolbar", pattern: /from\s+["'][^"']*toolbar[^"']*["']/ },
];

const importHits: string[] = [];
for (const { id, pattern } of FORBIDDEN_IMPORT_PATTERNS) {
  if (pattern.test(joined)) {
    importHits.push(id);
  }
}

assertCase(
  "d55.gov.noForbiddenImports",
  importHits.length === 0,
  importHits.length ? `forbidden imports: ${importHits.join(",")}` : "imports isolated"
);

/** Allowed non-relative imports: react only. */
const importLines = joined.match(/^\s*import\s+.+from\s+["'][^"']+["']/gm) ?? [];
const disallowedImports = importLines.filter((line) => {
  const match = line.match(/from\s+["']([^"']+)["']/);
  if (!match) return false;
  const spec = match[1];
  if (spec === "react" || spec.startsWith("react/")) return false;
  if (spec.startsWith("./") || spec.startsWith("../")) return false;
  return true;
});

assertCase(
  "d55.gov.allowedImportsOnly",
  disallowedImports.length === 0,
  disallowedImports.length
    ? `disallowed: ${disallowedImports.slice(0, 5).join(" | ")}`
    : "react + local only"
);

/** Forbidden capability / UX / persistence keywords (code only, comments stripped). */
const FORBIDDEN_KEYWORDS = [
  "drag",
  "resize",
  "portal",
  "createPortal",
  "floating",
  "overlay",
  "LayoutTree",
  "persist",
  "storage",
  "serialize",
  "deserialize",
  "localStorage",
  "sessionStorage",
  "IndexedDB",
] as const;

const keywordHits = FORBIDDEN_KEYWORDS.filter((kw) => {
  const pattern = new RegExp(`\\b${kw}\\b`, "i");
  return pattern.test(codeOnly);
});

assertCase(
  "d55.gov.noForbiddenKeywords",
  keywordHits.length === 0,
  keywordHits.length
    ? `keywords: ${keywordHits.join(",")}`
    : "no forbidden capability keywords"
);

/** No wiring: nothing outside windows/ may import the module during D55. */
const consumerHits: string[] = [];
for (const file of walkTsFiles(srcDir)) {
  const rel = relative(repoRoot, file).replace(/\\/g, "/");
  if (rel.startsWith("src/components/windows/")) continue;
  const source = readFileSync(file, "utf8");
  if (
    /@\/components\/windows\b/.test(source) ||
    /from\s+["'][^"']*components\/windows[^"']*["']/.test(source) ||
    /from\s+["']\.\.\/windows\b/.test(source) ||
    /from\s+["']\.\/windows\b/.test(source)
  ) {
    consumerHits.push(rel);
  }
}

assertCase(
  "d55.gov.noExternalWiring",
  consumerHits.length === 0,
  consumerHits.length
    ? `wired from: ${consumerHits.slice(0, 8).join(",")}`
    : "no external consumers"
);

const failed = results.filter((r) => !r.pass);
const summary = {
  phase: "d55-governance",
  pass: failed.length === 0,
  total: results.length,
  passed: results.length - failed.length,
  failed: failed.map((f) => f.id),
  results,
};

console.log(JSON.stringify(summary, null, 2));
console.log(
  summary.pass
    ? "\nPASS — d55-governance"
    : `\nFAIL — d55-governance (${failed.map((f) => f.id).join(", ")})`
);
process.exit(summary.pass ? 0 : 1);
