/**
 * D69.8 — Session Snapshots Foundation · architectural validation.
 * Authority: D69 API Freeze · Hard Rules.
 * Docs / structure only — does not modify production code.
 */
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const repoRoot = process.cwd();
const snapshotsDir = join(repoRoot, "src/components/session/snapshots");
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

const readSnapshots = (file: string): string =>
  readFile(join(snapshotsDir, file));

const REQUIRED_SNAPSHOT_FILES = [
  "SnapshotReason.ts",
  "SessionSnapshotTypes.ts",
  "SessionSnapshotFactory.ts",
  "SessionSnapshotStore.ts",
  "SessionSnapshotSerializer.ts",
  "SessionSnapshotDeserializer.ts",
  "index.ts",
] as const;

const BARREL_ALLOWLIST = new Set([
  "SnapshotReason",
  "SNAPSHOT_SCHEMA_VERSION",
  "SnapshotId",
  "SessionSnapshot",
  "SessionSnapshotRecord",
  "CreateSessionSnapshotOptions",
  "createSessionSnapshot",
  "SessionSnapshotStore",
  "createSessionSnapshotStore",
  "serializeSessionSnapshot",
  "deserializeSessionSnapshot",
]);

const INTERNAL_SNAPSHOT_MODULES =
  "SnapshotReason|SessionSnapshotTypes|SessionSnapshotFactory|SessionSnapshotStore|SessionSnapshotSerializer|SessionSnapshotDeserializer";

/* —— Structure —— */

assertCase(
  "d69.struct.snapshotsDirExists",
  existsSync(snapshotsDir),
  existsSync(snapshotsDir) ? "snapshots/ exists" : "snapshots/ missing"
);

for (const file of REQUIRED_SNAPSHOT_FILES) {
  const exists = existsSync(join(snapshotsDir, file));
  assertCase(
    `d69.struct.file.${file}`,
    exists,
    exists ? "exists" : "missing"
  );
}

const snapshotFiles = existsSync(snapshotsDir)
  ? readdirSync(snapshotsDir).filter(
      (f) => f.endsWith(".ts") || f.endsWith(".tsx")
    )
  : [];

assertCase(
  "d69.struct.exactSevenTsFiles",
  snapshotFiles.length === REQUIRED_SNAPSHOT_FILES.length &&
    REQUIRED_SNAPSHOT_FILES.every((f) => snapshotFiles.includes(f)),
  snapshotFiles.length === REQUIRED_SNAPSHOT_FILES.length
    ? "exactly 7 Freeze files"
    : `unexpected files: ${snapshotFiles.join(",")}`
);

const snapshotSources = snapshotFiles.map((file) => ({
  file,
  raw: readSnapshots(file),
  code: stripComments(readSnapshots(file)),
}));

const byFile = (name: string) =>
  snapshotSources.find((s) => s.file === name) ?? {
    file: name,
    raw: "",
    code: "",
  };

const reason = byFile("SnapshotReason.ts");
const types = byFile("SessionSnapshotTypes.ts");
const factory = byFile("SessionSnapshotFactory.ts");
const store = byFile("SessionSnapshotStore.ts");
const serializer = byFile("SessionSnapshotSerializer.ts");
const deserializer = byFile("SessionSnapshotDeserializer.ts");
const barrel = byFile("index.ts");
const sessionBarrel = readFile(sessionBarrelPath);
const sessionBarrelCode = stripComments(sessionBarrel);
const contextRaw = readFile(sessionContextPath);
const contextCode = stripComments(contextRaw);
const providerRaw = readFile(sessionProviderPath);
const providerCode = stripComments(providerRaw);
const allSnapshotsRaw = snapshotSources.map((s) => s.raw).join("\n");
const allSnapshotsCode = snapshotSources.map((s) => s.code).join("\n");

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
  "d69.barrel.allowlistExact",
  extraExports.length === 0 && missingExports.length === 0,
  extraExports.length === 0 && missingExports.length === 0
    ? `allowlist ${BARREL_ALLOWLIST.size}/${BARREL_ALLOWLIST.size}`
    : `extra=[${extraExports.join(",")}] missing=[${missingExports.join(",")}]`
);

assertCase(
  "d69.barrel.noWildcardOrParentReexport",
  !/export\s+\*\s+from/.test(barrel.raw) &&
    !/from\s+["'][^"']*persistence[^"']*["']/.test(barrel.raw) &&
    !/from\s+["'][^"']*restore[^"']*["']/.test(barrel.raw) &&
    !/from\s+["'][^"']*autosave[^"']*["']/.test(barrel.raw) &&
    !/\bSessionProvider\b/.test(barrel.code) &&
    !/\bSessionContext\b/.test(barrel.code) &&
    !/\bSessionRegistry\b/.test(barrel.code),
  "barrel has no wildcards / persistence / restore / autosave / Provider / Context / Registry"
);

assertCase(
  "d69.barrel.sessionIndexNoSnapshots",
  !/snapshots/i.test(sessionBarrelCode) &&
    !/from\s+["'][^"']*snapshots[^"']*["']/.test(sessionBarrel),
  "session/index.ts must NOT re-export snapshots/*"
);

/* —— Core purity (no React / JSX in snapshots/) —— */

const reactViolations: string[] = [];
for (const src of snapshotSources) {
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
  "d69.pure.noReactJsx",
  reactViolations.length === 0,
  reactViolations.length === 0
    ? "snapshots/* free of React/JSX"
    : `react/jsx: ${reactViolations.join(",")}`
);

/* —— Import isolation —— */

const importViolations: string[] = [];
for (const src of snapshotSources) {
  const imports = src.raw.matchAll(/from\s+["']([^"']+)["']/g);
  for (const match of imports) {
    const spec = match[1]!;
    if (spec === "react" || spec.startsWith("react/")) {
      importViolations.push(`${src.file}:${spec}`);
      continue;
    }
    if (
      /(?:^|[\\/])(?:persistence|restore|autosave|windows|tabs|content|series|workspace|docking|layout|toolbar|inspector)(?:[\\/]|$)/i.test(
        spec
      )
    ) {
      importViolations.push(`${src.file}:${spec}`);
      continue;
    }
    if (
      /SessionRegistry|SessionProvider|SessionContext|indexedDB|idb-keyval|openDB/i.test(
        spec
      )
    ) {
      importViolations.push(`${src.file}:${spec}`);
      continue;
    }
    if (spec.startsWith(".")) {
      const allowed =
        /^\.\.\/SessionTypes$/.test(spec) ||
        /^\.\.\/SessionState$/.test(spec) ||
        new RegExp(`^\\.\\/(${INTERNAL_SNAPSHOT_MODULES})$`).test(spec);
      if (!allowed) {
        importViolations.push(`${src.file}:${spec}`);
      }
      continue;
    }
    importViolations.push(`${src.file}:${spec}`);
  }
}

assertCase(
  "d69.imports.isolation",
  importViolations.length === 0,
  importViolations.length === 0
    ? "HR-import-isolation PASS"
    : `denied/unexpected: ${importViolations.join(",")}`
);

assertCase(
  "d69.imports.noIndexedDbUsage",
  !/\bindexedDB\b/.test(allSnapshotsCode) &&
    !/\bIDBDatabase\b/.test(allSnapshotsCode) &&
    !/\bopenDB\b/.test(allSnapshotsCode),
  "snapshots/* free of IndexedDB APIs"
);

/* —— API Freeze —— */

assertCase(
  "d69.api.snapshotReasonFrozen",
  /export const SnapshotReason\s*=\s*\{/.test(reason.raw) &&
    /MANUAL:\s*"MANUAL"/.test(reason.raw) &&
    /AUTOSAVE:\s*"AUTOSAVE"/.test(reason.raw) &&
    /RESTORE_POINT:\s*"RESTORE_POINT"/.test(reason.raw) &&
    /EXPORT:\s*"EXPORT"/.test(reason.raw) &&
    /BACKUP:\s*"BACKUP"/.test(reason.raw) &&
    !/\benum\s+SnapshotReason\b/.test(reason.code),
  "SnapshotReason const object Freeze (no TS enum)"
);

assertCase(
  "d69.api.schemaVersion",
  /export const SNAPSHOT_SCHEMA_VERSION\s*=\s*1\s+as const/.test(types.raw),
  "SNAPSHOT_SCHEMA_VERSION === 1"
);

const snapshotInterfaceMatch = types.code.match(
  /export\s+interface\s+SessionSnapshot\s*\{([^}]*)\}/
);
const snapshotInterfaceBody = snapshotInterfaceMatch?.[1] ?? "";

assertCase(
  "d69.api.sessionSnapshotReadonly",
  /export interface SessionSnapshot\s*\{/.test(types.raw) &&
    /readonly\s+id\s*:/.test(snapshotInterfaceBody) &&
    /readonly\s+sessionId\s*:/.test(snapshotInterfaceBody) &&
    /readonly\s+createdAt\s*:/.test(snapshotInterfaceBody) &&
    /readonly\s+reason\s*:/.test(snapshotInterfaceBody) &&
    /readonly\s+state\s*:/.test(snapshotInterfaceBody) &&
    !/\bdefinition\b/.test(snapshotInterfaceBody),
  "SessionSnapshot fully readonly · state only (no Definition)"
);

assertCase(
  "d69.api.sessionSnapshotRecordReadonly",
  /export interface SessionSnapshotRecord\s*\{/.test(types.raw) &&
    /readonly\s+schemaVersion\s*:/.test(types.code) &&
    /readonly\s+id\s*:/.test(types.code) &&
    /readonly\s+sessionId\s*:/.test(types.code) &&
    /readonly\s+createdAt\s*:/.test(types.code) &&
    /readonly\s+reason\s*:/.test(types.code) &&
    /readonly\s+state\s*:/.test(types.code),
  "SessionSnapshotRecord fully readonly + schemaVersion"
);

assertCase(
  "d69.api.noMutateApis",
  !/\bupdateSnapshot\b/.test(allSnapshotsCode) &&
    !/\bmutateSnapshot\b/.test(allSnapshotsCode) &&
    !/\breplaceSnapshot\b/.test(allSnapshotsCode),
  "no updateSnapshot / mutateSnapshot / replaceSnapshot"
);

assertCase(
  "d69.api.factorySurface",
  /export function createSessionSnapshot\s*\(/.test(factory.raw) &&
    /cloneSessionState/.test(factory.code),
  "createSessionSnapshot + cloneSessionState"
);

assertCase(
  "d69.api.storeSurface",
  /export function createSessionSnapshotStore\s*\(/.test(store.raw) &&
    /create\s*\(\s*snapshot\s*:\s*SessionSnapshot\s*\)\s*:\s*boolean/.test(
      store.code
    ) &&
    /get\s*\(\s*id\s*:\s*SnapshotId\s*\)\s*:\s*SessionSnapshot\s*\|\s*undefined/.test(
      store.code
    ) &&
    /remove\s*\(\s*id\s*:\s*SnapshotId\s*\)\s*:\s*boolean/.test(store.code) &&
    /clear\s*\(\s*\)\s*:\s*void/.test(store.code) &&
    /list\s*\(\s*\)\s*:\s*readonly\s+SessionSnapshot\s*\[\]/.test(store.code) &&
    /count\s*\(\s*\)\s*:\s*number/.test(store.code) &&
    !/\bupdate\s*\(/.test(store.code),
  "Store API Freeze: create/get/remove/clear/list/count · no update"
);

assertCase(
  "d69.api.serializeDeserialize",
  /export function serializeSessionSnapshot\s*\(/.test(serializer.raw) &&
    /SNAPSHOT_SCHEMA_VERSION/.test(serializer.code) &&
    /export function deserializeSessionSnapshot\s*\(/.test(deserializer.raw) &&
    /schemaVersion/.test(deserializer.code),
  "serialize embeds schemaVersion · deserialize gates schemaVersion"
);

/* —— Provider private integration —— */

assertCase(
  "d69.provider.privateSnapshotStoreWiring",
  /snapshotStoreRef/.test(providerCode) &&
    /useRef\s*<\s*SessionSnapshotStore\s*\|\s*null\s*>/.test(providerCode) &&
    /createSessionSnapshotStore\s*\(/.test(providerCode) &&
    /from\s+["']@\/components\/session\/snapshots["']/.test(providerRaw),
  "SessionProvider owns SnapshotStore privately via snapshots barrel"
);

assertCase(
  "d69.provider.noAutomaticSnapshotCreate",
  !/\bcreateSessionSnapshot\s*\(/.test(providerCode),
  "Provider does not call createSessionSnapshot (D70+)"
);

assertCase(
  "d69.provider.noSnapshotsOnContext",
  !/\bsnapshotStore\b/i.test(contextCode) &&
    !/\bcreateSessionSnapshotStore\b/.test(contextCode) &&
    !/\bSessionSnapshotStore\b/.test(contextCode) &&
    !/\bcreateSessionSnapshot\b/.test(contextCode) &&
    !/from\s+["'][^"']*snapshots[^"']*["']/.test(contextRaw),
  "SessionContext does not expose SnapshotStore"
);

assertCase(
  "d69.provider.noSnapshotsOnApiValue",
  !/\bsnapshotStore\b/i.test(providerCode) ||
    (/snapshotStoreRef/.test(providerCode) &&
      !/api\s*[:=][\s\S]*snapshotStore/i.test(providerCode) &&
      !/SessionContextValue[\s\S]*snapshotStore/i.test(providerCode)),
  "SnapshotStore not placed on SessionAPI / Context value"
);

/* —— Autosave isolation —— */

const autosaveFiles = existsSync(autosaveDir)
  ? readdirSync(autosaveDir).filter(
      (f) => f.endsWith(".ts") || f.endsWith(".tsx")
    )
  : [];
const autosaveRaw = autosaveFiles
  .map((f) => readFile(join(autosaveDir, f)))
  .join("\n");
const autosaveCode = stripComments(autosaveRaw);

assertCase(
  "d69.autosave.noCreateSessionSnapshot",
  !/\bcreateSessionSnapshot\s*\(/.test(autosaveCode) &&
    !/from\s+["'][^"']*snapshots[^"']*["']/.test(autosaveRaw),
  "autosave does not call/create SessionSnapshot (D70+)"
);

const failed = results.filter((r) => !r.pass);
const summary = {
  phase: "d69",
  pass: failed.length === 0,
  total: results.length,
  passed: results.length - failed.length,
  failed: failed.map((f) => f.id),
  results,
};

console.log(JSON.stringify(summary, null, 2));
console.log(
  summary.pass
    ? "\nPASS — validate:d69"
    : `\nFAIL — validate:d69 (${failed.map((f) => f.id).join(", ")})`
);
process.exit(summary.pass ? 0 : 1);
