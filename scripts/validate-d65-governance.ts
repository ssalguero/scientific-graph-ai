/**
 * D65.9 — Session Foundation · governance gate.
 * Authority: D65.0 API Freeze · Hard Rules (no app imports · no UI · domain purity).
 */
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const repoRoot = process.cwd();
const sessionDir = join(repoRoot, "src/components/session");
const windowsBarrelPath = join(
  repoRoot,
  "src/components/windows/index.ts"
);
const pagePath = join(repoRoot, "src/app/page.tsx");

const results: { id: string; pass: boolean; detail: string }[] = [];
const assertCase = (id: string, pass: boolean, detail: string) => {
  results.push({ id, pass, detail });
};

const stripComments = (source: string): string =>
  source
    .replace(/\/\*[\s\S]*?\*\//g, " ")
    .replace(/\/\/.*$/gm, " ");

const listTs = (dir: string): string[] =>
  existsSync(dir)
    ? readdirSync(dir).filter((f) => f.endsWith(".ts") || f.endsWith(".tsx"))
    : [];

assertCase(
  "d65.gov.sessionDirExists",
  existsSync(sessionDir),
  existsSync(sessionDir) ? "session/ exists" : "session/ missing"
);

const sessionFiles = listTs(sessionDir);
const sources = sessionFiles.map((file) => ({
  file,
  raw: readFileSync(join(sessionDir, file), "utf8"),
  code: stripComments(readFileSync(join(sessionDir, file), "utf8")),
}));

const allRaw = sources.map((s) => s.raw).join("\n");
const allCode = sources.map((s) => s.code).join("\n");

const DOMAIN_TS = new Set([
  "SessionTypes.ts",
  "SessionDefinition.ts",
  "SessionState.ts",
  "SessionRegistry.ts",
  "SessionSnapshot.ts",
]);

const domainSources = sources.filter((s) => DOMAIN_TS.has(s.file));
const domainCode = domainSources.map((s) => s.code).join("\n");
const domainRaw = domainSources.map((s) => s.raw).join("\n");

const REACT_FRONTIER = new Set([
  "SessionContext.tsx",
  "SessionProvider.tsx",
  "SessionBridge.tsx",
]);

assertCase(
  "d65.gov.reactFrontierOnly",
  sessionFiles
    .filter((f) => f.endsWith(".tsx"))
    .every((f) => REACT_FRONTIER.has(f)),
  "React frontier = Context / Provider / Bridge only"
);

assertCase(
  "d65.gov.domain.noReact",
  !/\bfrom\s+["']react["']/.test(domainRaw) &&
    !/\bfrom\s+["']react\//.test(domainRaw) &&
    !/\bReactNode\b/.test(domainCode) &&
    !/\bJSX\b/.test(domainCode),
  "domain .ts — no React imports / ReactNode"
);

assertCase(
  "d65.gov.domain.noHooks",
  !/\buse(State|Effect|Ref|Memo|Callback|Context|Reducer|Id|SyncExternalStore)\s*\(/.test(
    domainCode
  ),
  "domain .ts — no React hooks"
);

assertCase(
  "d65.gov.noCssTailwind",
  !/\.css["']/.test(allRaw) &&
    !/\bclassName\b/.test(allCode) &&
    !/\btailwind\b/i.test(allCode),
  "session/** — no CSS / Tailwind / className"
);

assertCase(
  "d65.gov.noAppImports",
  !/from\s+["'][^"']*\/app\//.test(allRaw) &&
    !/from\s+["']@\/app\//.test(allRaw),
  "session/** — no app/ imports"
);

assertCase(
  "d65.gov.noPageImports",
  !/from\s+["'][^"']*page["']/.test(allRaw) &&
    !/from\s+["'][^"']*app\/.*page/.test(allRaw),
  "session/** — no page.tsx imports"
);

assertCase(
  "d65.gov.noPersistence",
  !/\blocalStorage\b/.test(allCode) &&
    !/\bsessionStorage\b/.test(allCode) &&
    !/\bindexedDB\b/i.test(allCode),
  "session/** — no persistence APIs"
);

const windowsBarrel = existsSync(windowsBarrelPath)
  ? readFileSync(windowsBarrelPath, "utf8")
  : "";

assertCase(
  "d65.gov.noWindowsBarrelLeak",
  !/from\s+["']\.\/session/.test(windowsBarrel) &&
    !/from\s+["']\.\.\/session/.test(windowsBarrel) &&
    !/\bSessionProvider\b/.test(windowsBarrel) &&
    !/\bSessionBridge\b/.test(windowsBarrel) &&
    !/\bcreateSessionRegistry\b/.test(windowsBarrel),
  "windows/index.ts must not re-export session"
);

const page = existsSync(pagePath) ? readFileSync(pagePath, "utf8") : "";
const pageCode = stripComments(page);

assertCase(
  "d65.gov.page.barrelOnly",
  /from\s+["']@\/components\/session["']/.test(pageCode) &&
    !/from\s+["']@\/components\/session\//.test(pageCode),
  "page.tsx imports session barrel only (no deep imports)"
);

assertCase(
  "d65.gov.page.noDeepSession",
  !/from\s+["']@\/components\/session\/[^"']+["']/.test(pageCode),
  "page.tsx — no deep session/* imports"
);

const failed = results.filter((r) => !r.pass);
const summary = {
  phase: "d65-governance",
  pass: failed.length === 0,
  total: results.length,
  passed: results.length - failed.length,
  failed: failed.map((f) => f.id),
  results,
};

console.log(JSON.stringify(summary, null, 2));
console.log(
  summary.pass
    ? "\nPASS — d65-governance"
    : `\nFAIL — d65-governance (${failed.map((f) => f.id).join(", ")})`
);
process.exit(summary.pass ? 0 : 1);
