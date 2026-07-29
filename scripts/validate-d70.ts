/**
 * D70.7 — Restore Points Foundation · architectural validation.
 * Authority: D70.0 Architecture Freeze · Hard Rules.
 * Docs / structure only — does not modify production code.
 */
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const repoRoot = process.cwd();
const restorePointsDir = join(
  repoRoot,
  "src/components/session/restorePoints"
);
const sessionBarrelPath = join(repoRoot, "src/components/session/index.ts");
const snapshotsBarrelPath = join(
  repoRoot,
  "src/components/session/snapshots/index.ts"
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

const readRp = (file: string): string =>
  readFile(join(restorePointsDir, file));

const REQUIRED_RP_FILES = [
  "RestorePointTypes.ts",
  "RestorePointMetadata.ts",
  "RestorePointFactory.ts",
  "RestorePointRegistry.ts",
  "RestorePointSerializer.ts",
  "RestorePointDeserializer.ts",
  "index.ts",
] as const;

const BARREL_ALLOWLIST = new Set([
  "RestorePointOrigin",
  "RestorePointMetadata",
  "RestorePointId",
  "RESTORE_POINT_SCHEMA_VERSION",
  "RestorePointSchemaVersion",
  "RestorePoint",
  "RestorePointRecord",
  "CreateRestorePointOptions",
  "createRestorePoint",
  "RestorePointRegistry",
  "createRestorePointRegistry",
  "serializeRestorePoint",
  "deserializeRestorePoint",
]);

const INTERNAL_RP_MODULES =
  "RestorePointTypes|RestorePointMetadata|RestorePointFactory|RestorePointRegistry|RestorePointSerializer|RestorePointDeserializer";

/* —— Structure —— */

assertCase(
  "d70.struct.restorePointsDirExists",
  existsSync(restorePointsDir),
  existsSync(restorePointsDir)
    ? "restorePoints/ exists"
    : "restorePoints/ missing"
);

for (const file of REQUIRED_RP_FILES) {
  const exists = existsSync(join(restorePointsDir, file));
  assertCase(
    `d70.struct.file.${file}`,
    exists,
    exists ? "exists" : "missing"
  );
}

const rpFiles = existsSync(restorePointsDir)
  ? readdirSync(restorePointsDir).filter(
      (f) => f.endsWith(".ts") || f.endsWith(".tsx")
    )
  : [];

assertCase(
  "d70.struct.exactSevenTsFiles",
  rpFiles.length === REQUIRED_RP_FILES.length &&
    REQUIRED_RP_FILES.every((f) => rpFiles.includes(f)),
  rpFiles.length === REQUIRED_RP_FILES.length
    ? "exactly 7 Freeze files"
    : `unexpected files: ${rpFiles.join(",")}`
);

const rpSources = rpFiles.map((file) => ({
  file,
  raw: readRp(file),
  code: stripComments(readRp(file)),
}));

const byFile = (name: string) =>
  rpSources.find((s) => s.file === name) ?? {
    file: name,
    raw: "",
    code: "",
  };

const metadata = byFile("RestorePointMetadata.ts");
const types = byFile("RestorePointTypes.ts");
const factory = byFile("RestorePointFactory.ts");
const registry = byFile("RestorePointRegistry.ts");
const serializer = byFile("RestorePointSerializer.ts");
const deserializer = byFile("RestorePointDeserializer.ts");
const barrel = byFile("index.ts");
const sessionBarrel = readFile(sessionBarrelPath);
const sessionBarrelCode = stripComments(sessionBarrel);
const snapshotsBarrel = readFile(snapshotsBarrelPath);
const snapshotsBarrelCode = stripComments(snapshotsBarrel);
const providerRaw = readFile(sessionProviderPath);
const providerCode = stripComments(providerRaw);
const allRpCode = rpSources.map((s) => s.code).join("\n");
const allRpRaw = rpSources.map((s) => s.raw).join("\n");

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
  "d70.barrel.allowlistExact",
  extraExports.length === 0 && missingExports.length === 0,
  extraExports.length === 0 && missingExports.length === 0
    ? `allowlist ${BARREL_ALLOWLIST.size}/${BARREL_ALLOWLIST.size}`
    : `extra=[${extraExports.join(",")}] missing=[${missingExports.join(",")}]`
);

assertCase(
  "d70.barrel.noWildcardOrForbiddenReexport",
  !/export\s+\*\s+from/.test(barrel.raw) &&
    !/from\s+["'][^"']*persistence[^"']*["']/.test(barrel.raw) &&
    !/from\s+["'][^"']*\/restore[^"']*["']/.test(barrel.raw) &&
    !/from\s+["'][^"']*autosave[^"']*["']/.test(barrel.raw) &&
    !/\bSessionProvider\b/.test(barrel.code) &&
    !/\bSessionContext\b/.test(barrel.code) &&
    !/\bSessionRegistry\b/.test(barrel.code),
  "barrel has no wildcards / persistence / restore / autosave / Provider / Context / Registry"
);

assertCase(
  "d70.barrel.sessionIndexNoRestorePoints",
  !/restorePoints/i.test(sessionBarrelCode) &&
    !/from\s+["'][^"']*restorePoints[^"']*["']/.test(sessionBarrel),
  "session/index.ts must NOT re-export restorePoints/*"
);

assertCase(
  "d70.barrel.snapshotsIndexNoRestorePoints",
  !/restorePoints/i.test(snapshotsBarrelCode) &&
    !/from\s+["'][^"']*restorePoints[^"']*["']/.test(snapshotsBarrel),
  "snapshots/index.ts must NOT re-export restorePoints/*"
);

/* —— Core purity (no React / JSX) —— */

const reactViolations: string[] = [];
for (const src of rpSources) {
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
  "d70.pure.noReactJsx",
  reactViolations.length === 0,
  reactViolations.length === 0
    ? "restorePoints/* free of React/JSX"
    : `react/jsx: ${reactViolations.join(",")}`
);

/* —— Import isolation —— */

const importViolations: string[] = [];
for (const src of rpSources) {
  const imports = src.raw.matchAll(/from\s+["']([^"']+)["']/g);
  for (const match of imports) {
    const spec = match[1]!;
    if (spec === "react" || spec.startsWith("react/")) {
      importViolations.push(`${src.file}:${spec}`);
      continue;
    }
    if (spec === "@/components/session/snapshots") {
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
      /SessionRegistry|SessionProvider|SessionContext|SessionBridge|indexedDB|idb-keyval|openDB/i.test(
        spec
      )
    ) {
      importViolations.push(`${src.file}:${spec}`);
      continue;
    }
    if (spec.startsWith(".")) {
      const allowed = new RegExp(
        `^\\.\\/(${INTERNAL_RP_MODULES})$`
      ).test(spec);
      if (!allowed) {
        importViolations.push(`${src.file}:${spec}`);
      }
      continue;
    }
    importViolations.push(`${src.file}:${spec}`);
  }
}

assertCase(
  "d70.imports.isolation",
  importViolations.length === 0,
  importViolations.length === 0
    ? "HR-rp-import-isolation PASS"
    : `denied/unexpected: ${importViolations.join(",")}`
);

assertCase(
  "d70.imports.noIndexedDbUsage",
  !/\bindexedDB\b/.test(allRpCode) &&
    !/\bIDBDatabase\b/.test(allRpCode) &&
    !/\bopenDB\b/.test(allRpCode),
  "restorePoints/* free of IndexedDB APIs"
);

assertCase(
  "d70.imports.noProviderWiring",
  !/from\s+["'][^"']*SessionProvider[^"']*["']/.test(allRpRaw) &&
    !/\bSessionProvider\b/.test(allRpCode) &&
    !/restorePoints/i.test(providerCode),
  "no Provider dependency · Provider does not import restorePoints"
);

assertCase(
  "d70.imports.noSessionRegistry",
  !/\bSessionRegistry\b/.test(allRpCode) &&
    !/createSessionRegistry/.test(allRpCode),
  "restorePoints/* does not reference SessionRegistry"
);

/* —— API Freeze —— */

assertCase(
  "d70.api.originFrozen",
  /export const RestorePointOrigin\s*=\s*\{/.test(metadata.raw) &&
    /MANUAL:\s*"MANUAL"/.test(metadata.raw) &&
    /SYSTEM:\s*"SYSTEM"/.test(metadata.raw) &&
    /IMPORT:\s*"IMPORT"/.test(metadata.raw) &&
    !/\benum\s+RestorePointOrigin\b/.test(metadata.code),
  "RestorePointOrigin const object Freeze (no TS enum)"
);

assertCase(
  "d70.api.schemaVersion",
  /export const RESTORE_POINT_SCHEMA_VERSION\s*=\s*1\s+as const/.test(
    types.raw
  ),
  "RESTORE_POINT_SCHEMA_VERSION === 1"
);

const rpInterfaceMatch = types.code.match(
  /export\s+interface\s+RestorePoint\s*\{([^}]*)\}/
);
const rpInterfaceBody = rpInterfaceMatch?.[1] ?? "";

assertCase(
  "d70.api.restorePointReadonlySnapshot",
  /export interface RestorePoint\s*\{/.test(types.raw) &&
    /readonly\s+id\s*:/.test(rpInterfaceBody) &&
    /readonly\s+name\s*:/.test(rpInterfaceBody) &&
    /readonly\s+createdAt\s*:/.test(rpInterfaceBody) &&
    /readonly\s+origin\s*:/.test(rpInterfaceBody) &&
    /readonly\s+snapshot\s*:/.test(rpInterfaceBody) &&
    /readonly\s+metadata\s*:/.test(rpInterfaceBody) &&
    /SessionSnapshot/.test(rpInterfaceBody),
  "RestorePoint fully readonly · encapsulates SessionSnapshot"
);

assertCase(
  "d70.api.noMutateApis",
  !/\bupdateRestorePoint\b/.test(allRpCode) &&
    !/\breplaceRestorePoint\b/.test(allRpCode) &&
    !/\brenameRestorePoint\b/.test(allRpCode) &&
    !/\bmutateRestorePoint\b/.test(allRpCode) &&
    !/\breplaceSnapshot\b/.test(allRpCode),
  "no update/replace/rename/mutate/replaceSnapshot APIs"
);

assertCase(
  "d70.api.factoryUsesD69RestorePointReason",
  /export function createRestorePoint\s*\(/.test(factory.raw) &&
    /createSessionSnapshot\s*\(/.test(factory.code) &&
    /SnapshotReason\.RESTORE_POINT/.test(factory.code) &&
    /from\s+["']@\/components\/session\/snapshots["']/.test(factory.raw),
  "createRestorePoint → createSessionSnapshot + SnapshotReason.RESTORE_POINT"
);

assertCase(
  "d70.api.registrySurface",
  /export function createRestorePointRegistry\s*\(/.test(registry.raw) &&
    /create\s*\(\s*restorePoint\s*:\s*RestorePoint\s*\)\s*:\s*boolean/.test(
      registry.code
    ) &&
    /get\s*\(\s*id\s*:\s*RestorePointId\s*\)\s*:\s*RestorePoint\s*\|\s*undefined/.test(
      registry.code
    ) &&
    /remove\s*\(\s*id\s*:\s*RestorePointId\s*\)\s*:\s*boolean/.test(
      registry.code
    ) &&
    /clear\s*\(\s*\)\s*:\s*void/.test(registry.code) &&
    /list\s*\(\s*\)\s*:\s*readonly\s+RestorePoint\s*\[\]/.test(registry.code) &&
    /count\s*\(\s*\)\s*:\s*number/.test(registry.code) &&
    !/\bupdate\s*\(/.test(registry.code) &&
    !/\breplace\s*\(/.test(registry.code) &&
    !/\brename\s*\(/.test(registry.code) &&
    !/\bmutate\s*\(/.test(registry.code),
  "Registry API Freeze: create/get/remove/clear/list/count · no update/replace/rename/mutate"
);

assertCase(
  "d70.api.registryMapSsot",
  /new\s+Map\s*<\s*RestorePointId\s*,\s*RestorePoint\s*>/.test(registry.code),
  "Registry uses Map<RestorePointId, RestorePoint> SSOT"
);

assertCase(
  "d70.api.serializeReusesD69",
  /export function serializeRestorePoint\s*\(/.test(serializer.raw) &&
    /serializeSessionSnapshot\s*\(/.test(serializer.code) &&
    /RESTORE_POINT_SCHEMA_VERSION/.test(serializer.code) &&
    /from\s+["']@\/components\/session\/snapshots["']/.test(serializer.raw),
  "serializeRestorePoint reuses serializeSessionSnapshot (D69)"
);

assertCase(
  "d70.api.deserializeGatesSchema",
  /export function deserializeRestorePoint\s*\(/.test(deserializer.raw) &&
    /schemaVersion\s*!==\s*RESTORE_POINT_SCHEMA_VERSION/.test(
      deserializer.code
    ) &&
    /deserializeSessionSnapshot\s*\(/.test(deserializer.code) &&
    /from\s+["']@\/components\/session\/snapshots["']/.test(deserializer.raw),
  "deserializeRestorePoint gates schemaVersion · reuses deserializeSessionSnapshot"
);

const failed = results.filter((r) => !r.pass);
const summary = {
  phase: "d70",
  pass: failed.length === 0,
  total: results.length,
  passed: results.length - failed.length,
  failed: failed.map((f) => f.id),
  results,
};

console.log(JSON.stringify(summary, null, 2));
console.log(
  summary.pass
    ? "\nPASS — validate:d70"
    : `\nFAIL — validate:d70 (${failed.map((f) => f.id).join(", ")})`
);
process.exit(summary.pass ? 0 : 1);
