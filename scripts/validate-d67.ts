/**
 * D67.9 — Session Restore Foundation · architectural validation.
 * Authority: D67.0 Architecture Freeze · API Freeze · HR-Restore-Imports.
 */
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const repoRoot = process.cwd();
const restoreDir = join(repoRoot, "src/components/session/restore");
const sessionBarrelPath = join(repoRoot, "src/components/session/index.ts");

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

const readRestore = (file: string): string =>
  readFile(join(restoreDir, file));

const REQUIRED_RESTORE_FILES = [
  "RestoreTypes.ts",
  "RestoreErrors.ts",
  "RestoreValidator.ts",
  "RestoreReport.ts",
  "SessionRestoreEngine.ts",
  "index.ts",
] as const;

/* —— Structure —— */

assertCase(
  "d67.struct.restoreDirExists",
  existsSync(restoreDir),
  existsSync(restoreDir) ? "restore/ exists" : "restore/ missing"
);

for (const file of REQUIRED_RESTORE_FILES) {
  const exists = existsSync(join(restoreDir, file));
  assertCase(
    `d67.struct.file.${file}`,
    exists,
    exists ? "exists" : "missing"
  );
}

const restoreFiles = existsSync(restoreDir)
  ? readdirSync(restoreDir).filter(
      (f) => f.endsWith(".ts") || f.endsWith(".tsx")
    )
  : [];

const restoreSources = restoreFiles.map((file) => ({
  file,
  raw: readRestore(file),
  code: stripComments(readRestore(file)),
}));

const byFile = (name: string) =>
  restoreSources.find((s) => s.file === name) ?? {
    file: name,
    raw: "",
    code: "",
  };

const types = byFile("RestoreTypes.ts");
const errors = byFile("RestoreErrors.ts");
const validator = byFile("RestoreValidator.ts");
const report = byFile("RestoreReport.ts");
const engine = byFile("SessionRestoreEngine.ts");
const barrel = byFile("index.ts");
const sessionBarrel = readFile(sessionBarrelPath);
const sessionBarrelCode = stripComments(sessionBarrel);

/* —— API Freeze surface —— */

assertCase(
  "d67.api.RestoreStatus",
  /export type RestoreStatus\s*=/.test(types.raw) &&
    /"success"/.test(types.raw) &&
    /"partial"/.test(types.raw) &&
    /"failed"/.test(types.raw),
  "RestoreStatus = success | partial | failed"
);

assertCase(
  "d67.api.RestoreRequest",
  /export interface RestoreRequest\b/.test(types.raw) &&
    /readonly records\s*:\s*readonly SessionPersistenceRecord\[\]/.test(
      types.code
    ) &&
    /readonly registry\s*:\s*SessionRegistry/.test(types.code),
  "RestoreRequest = records + registry"
);

assertCase(
  "d67.api.RestoreStatistics",
  /export interface RestoreStatistics\b/.test(types.raw) &&
    /requested/.test(types.raw) &&
    /restored/.test(types.raw) &&
    /skipped/.test(types.raw) &&
    /failed/.test(types.raw),
  "RestoreStatistics Freeze fields"
);

assertCase(
  "d67.api.RestoreResult",
  /export interface RestoreResult\b/.test(types.raw) &&
    /status/.test(types.raw) &&
    /report/.test(types.raw) &&
    /statistics/.test(types.raw) &&
    /restoredIds/.test(types.raw),
  "RestoreResult Freeze fields"
);

assertCase(
  "d67.api.SessionRestoreEngine",
  /export interface SessionRestoreEngine\b/.test(types.raw) &&
    /restore\s*\(\s*request\s*:\s*RestoreRequest\s*\)\s*:\s*RestoreResult/.test(
      types.code
    ),
  "SessionRestoreEngine.restore(request): RestoreResult sync"
);

assertCase(
  "d67.api.createSessionRestoreEngine",
  /export function createSessionRestoreEngine\s*\(\s*\)\s*:\s*SessionRestoreEngine/.test(
    engine.code
  ),
  "createSessionRestoreEngine factory in SessionRestoreEngine.ts"
);

assertCase(
  "d67.api.engine.noAsync",
  !/\basync\s+/.test(engine.code) &&
    !/\bPromise\s*</.test(engine.code) &&
    !/\bPromise\s*</.test(types.code),
  "Engine / types — no async / Promise"
);

assertCase(
  "d67.api.RestoreError",
  /export type RestoreError\s*=/.test(errors.raw),
  "RestoreError union exported"
);

assertCase(
  "d67.api.RestoreValidator",
  /export interface RestoreValidator\b/.test(validator.raw) &&
    /export function createRestoreValidator\s*\(/.test(validator.raw),
  "RestoreValidator + createRestoreValidator"
);

assertCase(
  "d67.api.RestoreReport",
  /export interface RestoreReport\b/.test(report.raw) &&
    /export function createRestoreReport\s*\(/.test(report.raw),
  "RestoreReport + createRestoreReport"
);

assertCase(
  "d67.api.noSchemaVersion",
  !/\bschemaVersion\b/.test(types.code) &&
    !/\bschemaVersion\b/.test(validator.code) &&
    !/\bschemaVersion\b/.test(engine.code),
  "No schemaVersion on restore input / validator / engine"
);

/* —— Barrel allowlist —— */

const REQUIRED_BARREL_EXPORTS = [
  "RestoreStatus",
  "RestoreRequest",
  "RestoreStatistics",
  "RestoreResult",
  "SessionRestoreEngine",
  "createSessionRestoreEngine",
  "RestoreError",
  "MissingSnapshot",
  "CorruptedSnapshot",
  "UnsupportedVersion",
  "RegistryFailure",
  "ValidationFailure",
  "RestoreValidator",
  "createRestoreValidator",
  "RestoreReport",
  "createRestoreReport",
] as const;

const ALLOWED_BARREL_SYMBOLS = new Set<string>(REQUIRED_BARREL_EXPORTS);

function collectExportedSymbols(source: string): Set<string> {
  const symbols = new Set<string>();
  const typeBlocks = source.matchAll(/export\s+type\s*\{([\s\S]*?)\}/g);
  for (const match of typeBlocks) {
    for (const part of match[1].split(",")) {
      const name = part.trim().split(/\s+as\s+/)[0]?.trim();
      if (name && /^[A-Za-z_][\w]*$/.test(name)) {
        symbols.add(name);
      }
    }
  }
  const valueBlocks = source.matchAll(/export\s*\{([\s\S]*?)\}/g);
  for (const match of valueBlocks) {
    // skip type { } already handled — value export { } without type keyword
    if (/export\s+type\s*\{/.test(match[0])) {
      continue;
    }
    for (const part of match[1].split(",")) {
      const name = part.trim().split(/\s+as\s+/)[0]?.trim();
      if (name && /^[A-Za-z_][\w]*$/.test(name)) {
        symbols.add(name);
      }
    }
  }
  const named =
    source.matchAll(
      /export\s+(?:async\s+)?(?:function|const|type|interface|class)\s+(\w+)/g
    );
  for (const match of named) {
    symbols.add(match[1]);
  }
  return symbols;
}

const exportedSymbols = collectExportedSymbols(barrel.raw);
const missingExports = REQUIRED_BARREL_EXPORTS.filter(
  (name) => !exportedSymbols.has(name)
);
const unexpected = [...exportedSymbols].filter(
  (name) => !ALLOWED_BARREL_SYMBOLS.has(name)
);

assertCase(
  "d67.api.barrelRequiredExports",
  missingExports.length === 0,
  missingExports.length
    ? `missing: ${missingExports.join(",")}`
    : "restore/index.ts exports Freeze allowlist"
);

assertCase(
  "d67.api.barrelNoUnexpectedExports",
  unexpected.length === 0,
  unexpected.length
    ? `unexpected: ${unexpected.join(",")}`
    : "restore barrel exports match allowlist only"
);

assertCase(
  "d67.api.sessionBarrel.noRestoreReexport",
  !/from\s+["']\.\/restore/.test(sessionBarrelCode) &&
    !/\bcreateSessionRestoreEngine\b/.test(sessionBarrelCode) &&
    !/\bRestoreRequest\b/.test(sessionBarrelCode) &&
    !/\bSessionRestoreEngine\b/.test(sessionBarrelCode),
  "session/index.ts does not re-export restore/*"
);

/* —— Pureza (no React / Hooks / Context / JSX) —— */

const purityFailures: string[] = [];
for (const src of restoreSources) {
  if (/\bfrom\s+["']react["']/.test(src.raw) || /\bfrom\s+["']react\//.test(src.raw)) {
    purityFailures.push(`${src.file}:react-import`);
  }
  if (/\bcreateContext\b/.test(src.code)) {
    purityFailures.push(`${src.file}:createContext`);
  }
  if (/\buse[A-Z]\w*\s*\(/.test(src.code)) {
    purityFailures.push(`${src.file}:hook`);
  }
  if (/\bJSX\b/.test(src.code) || /<\s*[A-Z][\w]*[\s/>]/.test(src.code)) {
    purityFailures.push(`${src.file}:jsx`);
  }
  if (src.file.endsWith(".tsx")) {
    purityFailures.push(`${src.file}:tsx`);
  }
}

assertCase(
  "d67.pure.noReactHooksContextJsx",
  purityFailures.length === 0,
  purityFailures.length === 0
    ? "restore/* is pure TypeScript"
    : `violations: ${purityFailures.join(",")}`
);

/* —— Persistencia prohibida —— */

const persistenceHits: string[] = [];
for (const src of restoreSources) {
  if (/\bindexedDB\b/i.test(src.code) || /\bIDBDatabase\b/.test(src.code)) {
    persistenceHits.push(`${src.file}:indexedDB`);
  }
  if (/\blocalStorage\b/.test(src.code) || /\bsessionStorage\b/.test(src.code)) {
    persistenceHits.push(`${src.file}:webStorage`);
  }
}

assertCase(
  "d67.bound.noIndexedDbLocalStorage",
  persistenceHits.length === 0,
  persistenceHits.length === 0
    ? "no IndexedDB / localStorage in restore/*"
    : `hits: ${persistenceHits.join(",")}`
);

/* —— Restore input / no SessionSnapshot public API —— */

assertCase(
  "d67.input.SessionPersistenceRecord",
  /SessionPersistenceRecord/.test(types.raw) &&
    /readonly records\s*:\s*readonly SessionPersistenceRecord\[\]/.test(
      types.code
    ),
  "RestoreRequest uses SessionPersistenceRecord[]"
);

const snapshotPublicHits: string[] = [];
for (const src of restoreSources) {
  if (
    /export\s+(?:type|interface)\s+SessionSnapshot\b/.test(src.code) ||
    /import\s+[^;]*\bSessionSnapshot\b/.test(src.code) ||
    /:\s*SessionSnapshot\b/.test(src.code)
  ) {
    snapshotPublicHits.push(src.file);
  }
}

assertCase(
  "d67.input.noSessionSnapshotPublic",
  snapshotPublicHits.length === 0,
  snapshotPublicHits.length === 0
    ? "no public SessionSnapshot in restore/*"
    : `SessionSnapshot refs: ${snapshotPublicHits.join(",")}`
);

/* —— Pipeline —— */

assertCase(
  "d67.pipeline.createRestoreValidator",
  /createRestoreValidator\s*\(/.test(engine.code),
  "Engine uses createRestoreValidator()"
);

assertCase(
  "d67.pipeline.deserializeRegistry",
  /deserializeRegistry\s*\(/.test(engine.code) &&
    /from\s+["']\.\.\/persistence\/SessionDeserializer["']/.test(engine.raw),
  "Engine uses deserializeRegistry from D66 persistence"
);

assertCase(
  "d67.pipeline.registryRegister",
  /registry\.register\s*\(/.test(engine.code),
  "Engine writes via registry.register(...)"
);

assertCase(
  "d67.pipeline.noInternalRegistryAccess",
  !/\.entries\.set\b/.test(engine.code) &&
    !/\.map\.set\b/.test(engine.code) &&
    !/\bprivate\s+Map\b/.test(engine.code) &&
    !/\bunregister\s*\(/.test(engine.code),
  "Engine does not access SessionRegistry internals"
);

/* —— HR-Restore-Imports —— */

const importViolations: string[] = [];
for (const src of restoreSources) {
  const imports = src.raw.matchAll(/from\s+["']([^"']+)["']/g);
  for (const match of imports) {
    const spec = match[1];
    if (spec === "react" || spec.startsWith("react/")) {
      importViolations.push(`${src.file}:${spec}`);
      continue;
    }
    if (
      /(?:^|[\\/])(?:windows|tabs|content|series|workspace|docking|layout|toolbar|inspector)(?:[\\/]|$)/i.test(
        spec
      )
    ) {
      importViolations.push(`${src.file}:${spec}`);
      continue;
    }
    // Relative imports must stay in session domain / persistence deserialize / restore/*
    if (spec.startsWith(".")) {
      const allowed =
        /^\.\.\/Session(Registry|Types|Definition|State)$/.test(spec) ||
        /^\.\.\/persistence\/(SessionDeserializer|SessionPersistenceTypes)$/.test(
          spec
        ) ||
        /^\.\/(RestoreTypes|RestoreErrors|RestoreValidator|RestoreReport|SessionRestoreEngine)$/.test(
          spec
        );
      if (!allowed) {
        importViolations.push(`${src.file}:${spec}`);
      }
    }
  }
}

assertCase(
  "d67.imports.hrRestoreImports",
  importViolations.length === 0,
  importViolations.length === 0
    ? "HR-Restore-Imports PASS"
    : `denied/unexpected: ${importViolations.join(",")}`
);

const failed = results.filter((r) => !r.pass);
const summary = {
  phase: "d67",
  pass: failed.length === 0,
  total: results.length,
  passed: results.length - failed.length,
  failed: failed.map((f) => f.id),
  results,
};

console.log(JSON.stringify(summary, null, 2));
console.log(
  summary.pass
    ? "\nPASS — validate:d67"
    : `\nFAIL — validate:d67 (${failed.map((f) => f.id).join(", ")})`
);
process.exit(summary.pass ? 0 : 1);
