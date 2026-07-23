/**
 * D68.9 — Session Autosave Foundation · architectural validation.
 * Authority: D68.0 Architecture Freeze · API Freeze · Hard Rules.
 * Docs / structure only — does not modify production code.
 */
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const repoRoot = process.cwd();
const autosaveDir = join(repoRoot, "src/components/session/autosave");
const sessionBarrelPath = join(repoRoot, "src/components/session/index.ts");
const sessionContextPath = join(
  repoRoot,
  "src/components/session/SessionContext.tsx"
);
const sessionProviderPath = join(
  repoRoot,
  "src/components/session/SessionProvider.tsx"
);

const results: { id: string; pass: boolean; detail: string }[] = [];
const assertCase = (id: string, pass: boolean, detail: string) => {
  results.push({ id, pass, detail });
};

const stripComments = (source: string): string =>
  source
    .replace(/\/\*[\s\S]*?\*\//g, " ")
    .replace(/\/\/.*$/gm, " ");

const readFile = (full: string): string =>
  existsSync(full) ? readFileSync(full, "utf8") : "";

const readAutosave = (file: string): string =>
  readFile(join(autosaveDir, file));

const REQUIRED_AUTOSAVE_FILES = [
  "AutosaveTypes.ts",
  "DirtyTracker.ts",
  "AutosaveScheduler.ts",
  "AutosaveFlushPolicy.ts",
  "SessionAutosaveController.ts",
  "index.ts",
] as const;

const BARREL_ALLOWLIST = new Set([
  "AUTOSAVE_DEBOUNCE_MS",
  "AutosaveMutationKind",
  "AutosaveMutationEvent",
  "SessionAutosaveController",
  "SessionAutosaveControllerOptions",
  "createSessionAutosaveController",
  "DirtyTracker",
  "DirtyTrackerSnapshot",
  "createDirtyTracker",
  "AutosaveScheduler",
  "AutosaveSchedulerOptions",
  "createAutosaveScheduler",
  "AutosaveFlushOperation",
  "AutosaveFlushPolicy",
  "createAutosaveFlushPolicy",
]);

/* —— Structure —— */

assertCase(
  "d68.struct.autosaveDirExists",
  existsSync(autosaveDir),
  existsSync(autosaveDir) ? "autosave/ exists" : "autosave/ missing"
);

for (const file of REQUIRED_AUTOSAVE_FILES) {
  const exists = existsSync(join(autosaveDir, file));
  assertCase(
    `d68.struct.file.${file}`,
    exists,
    exists ? "exists" : "missing"
  );
}

const autosaveFiles = existsSync(autosaveDir)
  ? readdirSync(autosaveDir).filter(
      (f) => f.endsWith(".ts") || f.endsWith(".tsx")
    )
  : [];

assertCase(
  "d68.struct.exactSixTsFiles",
  autosaveFiles.length === REQUIRED_AUTOSAVE_FILES.length &&
    REQUIRED_AUTOSAVE_FILES.every((f) => autosaveFiles.includes(f)),
  autosaveFiles.length === REQUIRED_AUTOSAVE_FILES.length
    ? "exactly 6 Freeze files"
    : `unexpected files: ${autosaveFiles.join(",")}`
);

const autosaveSources = autosaveFiles.map((file) => ({
  file,
  raw: readAutosave(file),
  code: stripComments(readAutosave(file)),
}));

const byFile = (name: string) =>
  autosaveSources.find((s) => s.file === name) ?? {
    file: name,
    raw: "",
    code: "",
  };

const types = byFile("AutosaveTypes.ts");
const dirty = byFile("DirtyTracker.ts");
const scheduler = byFile("AutosaveScheduler.ts");
const policy = byFile("AutosaveFlushPolicy.ts");
const controller = byFile("SessionAutosaveController.ts");
const barrel = byFile("index.ts");
const sessionBarrel = readFile(sessionBarrelPath);
const sessionBarrelCode = stripComments(sessionBarrel);
const contextRaw = readFile(sessionContextPath);
const contextCode = stripComments(contextRaw);
const providerRaw = readFile(sessionProviderPath);
const providerCode = stripComments(providerRaw);

/* —— AUTOSAVE_DEBOUNCE_MS —— */

assertCase(
  "d68.api.debounceMs1000",
  /export const AUTOSAVE_DEBOUNCE_MS\s*=\s*1000\s+as const/.test(types.raw),
  "AUTOSAVE_DEBOUNCE_MS === 1000"
);

/* —— Barrel allowlist —— */

const barrelExportNames = new Set<string>();
for (const match of barrel.raw.matchAll(
  /export\s+(?:type\s+)?\{([^}]+)\}/g
)) {
  const body = match[1];
  for (const part of body.split(",")) {
    const name = part
      .trim()
      .split(/\s+as\s+/)[0]
      ?.trim();
    if (name) {
      barrelExportNames.add(name);
    }
  }
}
for (const match of barrel.raw.matchAll(
  /export\s+(?:const|function|class|type|interface)\s+(\w+)/g
)) {
  barrelExportNames.add(match[1]!);
}

const extraExports = [...barrelExportNames].filter(
  (n) => !BARREL_ALLOWLIST.has(n)
);
const missingExports = [...BARREL_ALLOWLIST].filter(
  (n) => !barrelExportNames.has(n)
);

assertCase(
  "d68.barrel.allowlistExact",
  extraExports.length === 0 && missingExports.length === 0,
  extraExports.length === 0 && missingExports.length === 0
    ? `allowlist ${BARREL_ALLOWLIST.size}/${BARREL_ALLOWLIST.size}`
    : `extra=[${extraExports.join(",")}] missing=[${missingExports.join(",")}]`
);

assertCase(
  "d68.barrel.noPersistenceRestoreReexport",
  !/from\s+["'][^"']*persistence[^"']*["']/.test(barrel.raw) &&
    !/from\s+["'][^"']*restore[^"']*["']/.test(barrel.raw) &&
    !/\bSessionProvider\b/.test(barrel.code) &&
    !/\bSessionContext\b/.test(barrel.code),
  "barrel does not re-export persistence/restore/Provider/Context"
);

/* —— session/index isolation —— */

assertCase(
  "d68.barrel.sessionIndexNoAutosave",
  !/autosave/i.test(sessionBarrelCode) &&
    !/from\s+["'][^"']*autosave[^"']*["']/.test(sessionBarrel),
  "session/index.ts must NOT re-export autosave/*"
);

/* —— Core purity (no React / JSX in autosave/) —— */

const reactViolations: string[] = [];
for (const src of autosaveSources) {
  if (
    /\bfrom\s+["']react["']/.test(src.raw) ||
    /\bfrom\s+["']react\//.test(src.raw)
  ) {
    reactViolations.push(`${src.file}:react-import`);
  }
  if (/\bcreateContext\b/.test(src.code)) {
    reactViolations.push(`${src.file}:createContext`);
  }
  if (/\buse[A-Z]\w*\s*\(/.test(src.code)) {
    reactViolations.push(`${src.file}:hook`);
  }
  if (
    /\bJSX\b/.test(src.code) ||
    /(?<![\w$])<\s*[A-Z][\w]*[\s/>]/.test(src.code)
  ) {
    reactViolations.push(`${src.file}:jsx`);
  }
  if (src.file.endsWith(".tsx")) {
    reactViolations.push(`${src.file}:tsx`);
  }
}

assertCase(
  "d68.pure.noReactJsx",
  reactViolations.length === 0,
  reactViolations.length === 0
    ? "autosave/* free of React/JSX"
    : `react/jsx: ${reactViolations.join(",")}`
);

/* —— Import isolation —— */

const importViolations: string[] = [];
for (const src of autosaveSources) {
  const imports = src.raw.matchAll(/from\s+["']([^"']+)["']/g);
  for (const match of imports) {
    const spec = match[1]!;
    if (spec === "react" || spec.startsWith("react/")) {
      importViolations.push(`${src.file}:${spec}`);
      continue;
    }
    if (
      /(?:^|[\\/])(?:restore|windows|tabs|content|series|workspace|docking|layout|toolbar|inspector)(?:[\\/]|$)/i.test(
        spec
      )
    ) {
      importViolations.push(`${src.file}:${spec}`);
      continue;
    }
    if (
      /useProjectDraftAutosave|project\/.*autosave|autosave-status|saveAutosaveDraft/i.test(
        spec
      )
    ) {
      importViolations.push(`${src.file}:${spec}`);
      continue;
    }
    if (spec.startsWith(".")) {
      const allowed =
        /^\.\.\/SessionTypes$/.test(spec) ||
        /^\.\.\/persistence\/SessionPersistenceTypes$/.test(spec) ||
        /^\.\/(AutosaveTypes|DirtyTracker|AutosaveScheduler|AutosaveFlushPolicy|SessionAutosaveController)$/.test(
          spec
        );
      if (!allowed) {
        importViolations.push(`${src.file}:${spec}`);
      }
    }
  }
}

assertCase(
  "d68.imports.isolation",
  importViolations.length === 0,
  importViolations.length === 0
    ? "HR-import-isolation PASS"
    : `denied/unexpected: ${importViolations.join(",")}`
);

/* —— Controller API Freeze —— */

assertCase(
  "d68.api.controllerSurface",
  /notifyMutation\s*\(/.test(types.raw) &&
    /pause\s*\(\s*\)\s*:\s*void/.test(types.code) &&
    /resume\s*\(\s*\)\s*:\s*void/.test(types.code) &&
    /flush\s*\(\s*\)\s*:\s*Promise\s*<\s*void\s*>/.test(types.code) &&
    /dispose\s*\(\s*\)\s*:\s*void/.test(types.code) &&
    /export function createSessionAutosaveController\s*\(/.test(
      controller.raw
    ),
  "Controller API: notifyMutation/pause/resume/flush/dispose + factory"
);

assertCase(
  "d68.api.mutationKinds",
  /AutosaveMutationKind\s*=\s*"register"\s*\|\s*"unregister"\s*\|\s*"updateState"/.test(
    types.code
  ),
  "AutosaveMutationKind Freeze"
);

/* —— DirtyTracker API Freeze —— */

assertCase(
  "d68.api.dirtyTracker",
  /export function createDirtyTracker\s*\(/.test(dirty.raw) &&
    /mark\s*\(\s*sessionId\s*:\s*SessionId\s*\)\s*:\s*void/.test(dirty.code) &&
    /markRemoved\s*\(\s*sessionId\s*:\s*SessionId\s*\)\s*:\s*void/.test(
      dirty.code
    ) &&
    /clear\s*\(\s*\)\s*:\s*void/.test(dirty.code) &&
    /snapshot\s*\(\s*\)\s*:\s*DirtyTrackerSnapshot/.test(dirty.code) &&
    /needsFullRewrite/.test(dirty.raw) &&
    /dirtyIds/.test(dirty.raw),
  "DirtyTracker API Freeze"
);

/* —— Scheduler API Freeze —— */

assertCase(
  "d68.api.scheduler",
  /export function createAutosaveScheduler\s*\(/.test(scheduler.raw) &&
    /schedule\s*\(\s*callback\s*:\s*\(\s*\)\s*=>\s*void\s*\)\s*:\s*void/.test(
      scheduler.code
    ) &&
    /cancel\s*\(\s*\)\s*:\s*void/.test(scheduler.code) &&
    /flushNow\s*\(\s*\)\s*:\s*void/.test(scheduler.code) &&
    /dispose\s*\(\s*\)\s*:\s*void/.test(scheduler.code),
  "AutosaveScheduler API Freeze"
);

/* —— FlushPolicy API Freeze —— */

assertCase(
  "d68.api.flushPolicy",
  /export function createAutosaveFlushPolicy\s*\(/.test(policy.raw) &&
    /decide\s*\(\s*snapshot\s*:\s*DirtyTrackerSnapshot\s*\)\s*:\s*AutosaveFlushOperation/.test(
      policy.code
    ) &&
    /"none"/.test(policy.raw) &&
    /"persistSession"/.test(policy.raw) &&
    /"persistRegistry"/.test(policy.raw) &&
    /"clearThenPersistRegistry"/.test(policy.raw),
  "AutosaveFlushPolicy API Freeze"
);

assertCase(
  "d68.policy.clearOnlyOnRewrite",
  /needsFullRewrite/.test(policy.code) &&
    /clearThenPersistRegistry/.test(policy.code),
  "FlushPolicy gates clear path on needsFullRewrite"
);

/* —— Provider private integration —— */

assertCase(
  "d68.provider.privateAutosaveWiring",
  /createSessionAutosaveController\s*\(/.test(providerCode) &&
    /notifyMutation\s*\(/.test(providerCode) &&
    /\.dispose\s*\(/.test(providerCode) &&
    /from\s+["']@\/components\/session\/autosave["']/.test(providerRaw),
  "SessionProvider owns Controller privately via autosave barrel"
);

assertCase(
  "d68.provider.noAutosaveOnContext",
  !/\bautosave\b/i.test(contextCode) &&
    !/\bnotifyMutation\b/.test(contextCode) &&
    !/\bcreateSessionAutosaveController\b/.test(contextCode) &&
    !/from\s+["'][^"']*autosave[^"']*["']/.test(contextRaw),
  "SessionContext does not expose Autosave"
);

assertCase(
  "d68.provider.noDirectPersistIo",
  !/\.persistSession\s*\(/.test(providerCode) &&
    !/\.persistRegistry\s*\(/.test(providerCode) &&
    !/\.save\s*\(/.test(providerCode) &&
    !/\.load\s*\(/.test(providerCode),
  "Provider does not call Bridge/Adapter I/O directly (Controller path only)"
);

assertCase(
  "d68.provider.hrNoDefaultMountPersist",
  /HR-no-default-mount-persist/.test(providerRaw) ||
    /must NOT notify autosave/.test(providerRaw),
  "Provider documents HR-no-default-mount-persist on bootstrap register"
);

const failed = results.filter((r) => !r.pass);
const summary = {
  phase: "d68",
  pass: failed.length === 0,
  total: results.length,
  passed: results.length - failed.length,
  failed: failed.map((f) => f.id),
  results,
};

console.log(JSON.stringify(summary, null, 2));
console.log(
  summary.pass
    ? "\nPASS — validate:d68"
    : `\nFAIL — validate:d68 (${failed.map((f) => f.id).join(", ")})`
);
process.exit(summary.pass ? 0 : 1);
