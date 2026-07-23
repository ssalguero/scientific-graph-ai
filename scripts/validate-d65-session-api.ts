/**
 * D65.9 — Session Foundation · Session API Freeze gate.
 * Authority: D65.0 API Freeze · D65.1–D65.8 builds.
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const repoRoot = process.cwd();
const sessionDir = join(repoRoot, "src/components/session");
const windowsDir = join(repoRoot, "src/components/windows");

const results: { id: string; pass: boolean; detail: string }[] = [];
const assertCase = (id: string, pass: boolean, detail: string) => {
  results.push({ id, pass, detail });
};

const readSession = (file: string): string => {
  const full = join(sessionDir, file);
  return existsSync(full) ? readFileSync(full, "utf8") : "";
};

const REQUIRED_SESSION_FILES = [
  "SessionTypes.ts",
  "SessionDefinition.ts",
  "SessionState.ts",
  "SessionRegistry.ts",
  "SessionContext.tsx",
  "SessionProvider.tsx",
  "SessionBridge.tsx",
  "index.ts",
] as const;

for (const file of REQUIRED_SESSION_FILES) {
  const exists = existsSync(join(sessionDir, file));
  assertCase(
    `d65.api.session.file.${file}`,
    exists,
    exists ? "exists" : "missing"
  );
}

const barrel = readSession("index.ts");
const types = readSession("SessionTypes.ts");
const definition = readSession("SessionDefinition.ts");
const state = readSession("SessionState.ts");
const registry = readSession("SessionRegistry.ts");
const context = readSession("SessionContext.tsx");
const provider = readSession("SessionProvider.tsx");
const bridge = readSession("SessionBridge.tsx");
const windowsBarrel = existsSync(join(windowsDir, "index.ts"))
  ? readFileSync(join(windowsDir, "index.ts"), "utf8")
  : "";

/* —— Core type / factory surface —— */

assertCase(
  "d65.api.SessionId",
  /export type SessionId\s*=/.test(types),
  "SessionId exported from SessionTypes"
);

assertCase(
  "d65.api.SessionMetadata",
  /export interface SessionMetadata\b/.test(types) ||
    /export type SessionMetadata\b/.test(types),
  "SessionMetadata exported from SessionTypes"
);

assertCase(
  "d65.api.SessionEntry",
  /export interface SessionEntry\b/.test(types) ||
    /export type SessionEntry\b/.test(types),
  "SessionEntry exported from SessionTypes"
);

assertCase(
  "d65.api.SessionDefinition",
  /export type SessionDefinition\s*=/.test(definition) &&
    /createSessionDefinition\s*\(/.test(definition),
  "SessionDefinition + createSessionDefinition"
);

assertCase(
  "d65.api.SessionState",
  /export type SessionState\s*=/.test(state) &&
    /createEmptySessionState\s*\(/.test(state) &&
    /cloneSessionState\s*\(/.test(state),
  "SessionState + createEmptySessionState + cloneSessionState"
);

assertCase(
  "d65.api.createSessionRegistry",
  /export function createSessionRegistry\s*\(/.test(registry) &&
    /export type SessionRegistry\s*=/.test(registry) &&
    /register\s*\(/.test(registry) &&
    /unregister\s*\(/.test(registry) &&
    /get\s*\(/.test(registry) &&
    /list\s*\(/.test(registry) &&
    /updateState\s*\(/.test(registry),
  "createSessionRegistry + register/unregister/get/list/updateState"
);

assertCase(
  "d65.api.SessionContext",
  /export const SessionContext\b/.test(context) &&
    /export function useSessionContext\s*\(/.test(context),
  "SessionContext + useSessionContext"
);

assertCase(
  "d65.api.SessionProvider",
  /export function SessionProvider\s*\(/.test(provider),
  "SessionProvider exported"
);

assertCase(
  "d65.api.SessionBridge",
  /export function SessionBridge\s*\(/.test(bridge) &&
    /return\s+null\s*;/.test(bridge),
  "SessionBridge exported · renders null"
);

/* —— Public barrel exports (exact allowlist) —— */

const REQUIRED_BARREL_EXPORTS = [
  "SessionId",
  "SessionMetadata",
  "SessionEntry",
  "createSessionRegistry",
  "SessionContext",
  "useSessionContext",
  "SessionProvider",
  "SessionBridge",
] as const;

const missingExports = REQUIRED_BARREL_EXPORTS.filter(
  (name) => !new RegExp(`\\b${name}\\b`).test(barrel)
);

assertCase(
  "d65.api.sessionBarrelExports",
  missingExports.length === 0,
  missingExports.length
    ? `missing: ${missingExports.join(",")}`
    : "session/index.ts exports D65.1–D65.8 surface"
);

const ALLOWED_BARREL_SYMBOLS = new Set<string>(REQUIRED_BARREL_EXPORTS);

const exportedSymbols = new Set<string>();
for (const line of barrel.split("\n")) {
  if (!/^\s*export\s/.test(line)) {
    continue;
  }
  const typeBlock = line.match(/export\s+type\s*\{([^}]+)\}/);
  if (typeBlock) {
    for (const part of typeBlock[1].split(",")) {
      const name = part.trim().split(/\s+as\s+/)[0]?.trim();
      if (name) {
        exportedSymbols.add(name);
      }
    }
    continue;
  }
  const valueBlock = line.match(/export\s*\{([^}]+)\}/);
  if (valueBlock) {
    for (const part of valueBlock[1].split(",")) {
      const name = part.trim().split(/\s+as\s+/)[0]?.trim();
      if (name) {
        exportedSymbols.add(name);
      }
    }
    continue;
  }
  const named =
    line.match(/export\s+(?:async\s+)?function\s+(\w+)/) ||
    line.match(/export\s+const\s+(\w+)/) ||
    line.match(/export\s+class\s+(\w+)/) ||
    line.match(/export\s+type\s+(\w+)/) ||
    line.match(/export\s+interface\s+(\w+)/);
  if (named) {
    exportedSymbols.add(named[1]);
  }
}

const unexpected = [...exportedSymbols].filter(
  (name) => !ALLOWED_BARREL_SYMBOLS.has(name)
);

assertCase(
  "d65.api.noUnexpectedBarrelExports",
  unexpected.length === 0,
  unexpected.length
    ? `unexpected: ${unexpected.join(",")}`
    : "barrel exports match allowlist"
);

/* —— no leak into windows/index.ts —— */

const SESSION_LEAKS = [
  "SessionId",
  "SessionEntry",
  "SessionProvider",
  "SessionBridge",
  "createSessionRegistry",
  "useSessionContext",
  "SessionContext",
] as const;

const windowsExportLines = windowsBarrel
  .split("\n")
  .filter((l) => /^\s*export\s/.test(l))
  .join("\n");

const leaked = SESSION_LEAKS.filter((name) =>
  new RegExp(`\\b${name}\\b`).test(windowsExportLines)
);

assertCase(
  "d65.api.noWindowsBarrelLeak",
  leaked.length === 0 &&
    !/from\s+["']\.\/session/.test(windowsBarrel) &&
    !/from\s+["']\.\.\/session/.test(windowsBarrel),
  leaked.length
    ? `leaked: ${leaked.join(",")}`
    : "Session* not exported from windows/index.ts"
);

const failed = results.filter((r) => !r.pass);
const summary = {
  phase: "d65-session-api",
  pass: failed.length === 0,
  total: results.length,
  passed: results.length - failed.length,
  failed: failed.map((f) => f.id),
  results,
};

console.log(JSON.stringify(summary, null, 2));
console.log(
  summary.pass
    ? "\nPASS — d65-session-api"
    : `\nFAIL — d65-session-api (${failed.map((f) => f.id).join(", ")})`
);
process.exit(summary.pass ? 0 : 1);
