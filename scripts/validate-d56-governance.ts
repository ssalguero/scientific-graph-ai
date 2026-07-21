/**
 * D56.5 — Floating Windows Foundation governance gate.
 * Authority: D56 presentational + bridge architecture · Zero UX.
 */
import { existsSync, readFileSync, readdirSync } from "node:fs";
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

const HOOK_PATTERN =
  /\b(useState|useReducer|useEffect|useMemo|useCallback|useContext|useWindowContext)\s*\(/;

const floatingWindow = read("FloatingWindow.tsx");
const floatingLayer = read("FloatingWindowLayer.tsx");
const floatingBridge = read("FloatingWindowBridge.tsx");
const floatingTypes = read("FloatingWindowTypes.ts");

const floatingFiles = [
  "FloatingWindow.tsx",
  "FloatingWindowLayer.tsx",
  "FloatingWindowBridge.tsx",
  "FloatingWindowTypes.ts",
] as const;

assertCase(
  "d56.gov.floatingWindow.noHooks",
  !HOOK_PATTERN.test(stripComments(floatingWindow)),
  "FloatingWindow has no hooks"
);

assertCase(
  "d56.gov.floatingLayer.noHooks",
  !HOOK_PATTERN.test(stripComments(floatingLayer)),
  "FloatingWindowLayer has no hooks"
);

assertCase(
  "d56.gov.floatingLayer.noWindowManager",
  !(
    floatingLayer.match(/^\s*import\s+.+from\s+["'][^"']+["']/gm) ?? []
  ).some((line) => /WindowManager/.test(line)) &&
    !/from\s+["']\.\/WindowManager["']/.test(stripComments(floatingLayer)),
  "Layer does not import WindowManager"
);

assertCase(
  "d56.gov.floatingLayer.noWorkspace",
  !/workspace/i.test(
    (floatingLayer.match(/from\s+["'][^"']+["']/g) ?? []).join("\n")
  ),
  "Layer does not import Workspace"
);

assertCase(
  "d56.gov.bridge.usesWindowContext",
  /\buseWindowContext\s*\(/.test(stripComments(floatingBridge)),
  "Bridge calls useWindowContext()"
);

assertCase(
  "d56.gov.bridge.emptyWindows",
  /<FloatingWindowLayer\s+windows=\{\[\]\}\s*\/>/.test(
    stripComments(floatingBridge)
  ),
  "Bridge returns FloatingWindowLayer windows={[]}"
);

assertCase(
  "d56.gov.bridge.onlyExtraHookIsContext",
  !/\b(useState|useReducer|useEffect|useMemo|useCallback)\s*\(/.test(
    stripComments(floatingBridge)
  ),
  "Bridge has no state/effect/memo hooks"
);

/** Among Floating* files, only Bridge may call useWindowContext. */
const floatingSources: { file: string; source: string }[] = [
  { file: "FloatingWindow.tsx", source: floatingWindow },
  { file: "FloatingWindowLayer.tsx", source: floatingLayer },
  { file: "FloatingWindowTypes.ts", source: floatingTypes },
];

const illicitContext = floatingSources.filter(({ source }) =>
  /\buseWindowContext\s*\(/.test(stripComments(source))
);

assertCase(
  "d56.gov.bridgeSoleContextConsumer",
  illicitContext.length === 0,
  illicitContext.length
    ? `useWindowContext in: ${illicitContext.map((f) => f.file).join(",")}`
    : "Bridge is sole Floating* useWindowContext consumer"
);

const joinedFloating = floatingFiles.map((f) => read(f)).join("\n");

const FORBIDDEN_IMPORT_PATTERNS: { id: string; pattern: RegExp }[] = [
  { id: "scientific", pattern: /from\s+["'][^"']*scientific[^"']*["']/ },
  {
    id: "graph",
    pattern:
      /from\s+["'][^"']*(?:\/graph\/|@\/components\/graph|@\/lib\/graph)[^"']*["']/,
  },
  { id: "analysis", pattern: /from\s+["'][^"']*analysis[^"']*["']/ },
  {
    id: "page",
    pattern: /from\s+["'][^"']*(?:@\/app\/page|src\/app\/page|\/page["'])/,
  },
];

const importHits: string[] = [];
for (const { id, pattern } of FORBIDDEN_IMPORT_PATTERNS) {
  if (pattern.test(joinedFloating)) {
    importHits.push(id);
  }
}

assertCase(
  "d56.gov.noForbiddenImports",
  importHits.length === 0,
  importHits.length
    ? `forbidden imports: ${importHits.join(",")}`
    : "no scientific/graph/analysis/page imports"
);

const FORBIDDEN_CAPABILITY_KEYWORDS = [
  "drag",
  "resize",
  "snap",
  "createPortal",
  "persist",
  "localStorage",
  "sessionStorage",
  "IndexedDB",
] as const;

const capabilityHits = FORBIDDEN_CAPABILITY_KEYWORDS.filter((kw) => {
  const pattern = new RegExp(`\\b${kw}\\b`, "i");
  return floatingFiles.some((file) =>
    pattern.test(stripComments(read(file)))
  );
});

assertCase(
  "d56.gov.noForbiddenCapabilities",
  capabilityHits.length === 0,
  capabilityHits.length
    ? `keywords: ${capabilityHits.join(",")}`
    : "no drag/resize/snap/persist capabilities"
);

assertCase(
  "d56.gov.singleLayer",
  existsSync(join(windowsDir, "FloatingWindowLayer.tsx")) &&
    readdirSync(windowsDir).filter((n) =>
      /^FloatingWindowLayer\./.test(n)
    ).length === 1,
  "single FloatingWindowLayer file"
);

const failed = results.filter((r) => !r.pass);
const summary = {
  phase: "d56-governance",
  pass: failed.length === 0,
  total: results.length,
  passed: results.length - failed.length,
  failed: failed.map((f) => f.id),
  results,
};

console.log(JSON.stringify(summary, null, 2));
console.log(
  summary.pass
    ? "\nPASS — d56-governance"
    : `\nFAIL — d56-governance (${failed.map((f) => f.id).join(", ")})`
);
process.exit(summary.pass ? 0 : 1);
