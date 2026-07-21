/**
 * D55.4 — Multi-Window Foundation API Freeze gate.
 * Authority: docs/D55.1-multi-window-discovery.md · D55.2 barrel freeze.
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const repoRoot = process.cwd();
const windowsDir = join(repoRoot, "src/components/windows");
const barrelPath = join(windowsDir, "index.ts");

const results: { id: string; pass: boolean; detail: string }[] = [];
const assertCase = (id: string, pass: boolean, detail: string) => {
  results.push({ id, pass, detail });
};

const read = (file: string): string => {
  const full = join(windowsDir, file);
  return existsSync(full) ? readFileSync(full, "utf8") : "";
};

const ALLOWED_BARREL_EXPORTS = [
  "WindowDefinition",
  "WindowState",
  "WindowHandle",
  "WindowEventType",
  "WindowEvent",
  "WindowAPI",
  "createWindowRegistry",
  "WindowProvider",
  "WindowManager",
  "useWindowContext",
] as const;

function collectBarrelExports(source: string): string[] {
  const names = new Set<string>();

  for (const block of source.matchAll(
    /export\s+type\s*\{([^}]+)\}/g
  )) {
    for (const part of block[1].split(",")) {
      const name = part.trim().split(/\s+as\s+/)[0]?.trim();
      if (name) names.add(name);
    }
  }

  for (const block of source.matchAll(
    /export\s*\{([^}]+)\}/g
  )) {
    // skip if this was already handled as export type { } — type blocks also match \{
    const full = block[0];
    if (/export\s+type\s*\{/.test(full)) continue;
    for (const part of block[1].split(",")) {
      const name = part.trim().split(/\s+as\s+/)[0]?.trim();
      if (name) names.add(name);
    }
  }

  for (const m of source.matchAll(
    /export\s+(?:async\s+)?(?:function|const|class|let|var)\s+(\w+)/g
  )) {
    names.add(m[1]);
  }

  return Array.from(names).sort();
}

assertCase(
  "d55.api.barrelExists",
  existsSync(barrelPath),
  existsSync(barrelPath) ? "index.ts exists" : "missing index.ts"
);

const barrelSource = read("index.ts");
const typesSource = read("WindowTypes.ts");
const registrySource = read("WindowRegistry.ts");
const contextSource = read("WindowContext.tsx");
const managerSource = read("WindowManager.tsx");

const exported = collectBarrelExports(barrelSource);
const allowedSet = new Set<string>(ALLOWED_BARREL_EXPORTS);
const missing = ALLOWED_BARREL_EXPORTS.filter((n) => !exported.includes(n));
const extra = exported.filter((n) => !allowedSet.has(n));

assertCase(
  "d55.api.barrelExactExports",
  missing.length === 0 && extra.length === 0,
  missing.length || extra.length
    ? `missing=[${missing.join(",")}] extra=[${extra.join(",")}]`
    : `exact ${ALLOWED_BARREL_EXPORTS.length} symbols`
);

assertCase(
  "d55.api.windowDefinition",
  /export interface WindowDefinition\b/.test(typesSource) &&
    /id:\s*string/.test(typesSource) &&
    /title:\s*string/.test(typesSource) &&
    /dockId\?:/.test(typesSource) &&
    /visible:\s*boolean/.test(typesSource) &&
    /metadata\?:\s*Record<\s*string,\s*unknown\s*>/.test(typesSource),
  "WindowDefinition shape"
);

assertCase(
  "d55.api.windowState",
  /export interface WindowState\b/.test(typesSource) &&
    /windows:\s*Map<\s*string,\s*WindowDefinition\s*>/.test(typesSource) &&
    /activeId\?:/.test(typesSource) &&
    /focusedId\?:/.test(typesSource) &&
    /minimizedIds:\s*Set<\s*string\s*>/.test(typesSource),
  "WindowState shape"
);

assertCase(
  "d55.api.windowHandle",
  /export interface WindowHandle\b/.test(typesSource) &&
    /id:\s*string/.test(typesSource),
  "WindowHandle shape"
);

assertCase(
  "d55.api.windowEventType",
  /export type WindowEventType\s*=/.test(typesSource) &&
    /"create"/.test(typesSource) &&
    /"register"/.test(typesSource) &&
    /"activate"/.test(typesSource) &&
    /"focus"/.test(typesSource) &&
    /"minimize"/.test(typesSource) &&
    /"restore"/.test(typesSource) &&
    /"close"/.test(typesSource),
  "WindowEventType closed union"
);

assertCase(
  "d55.api.windowEvent",
  /export interface WindowEvent\b/.test(typesSource) &&
    /type:\s*WindowEventType/.test(typesSource) &&
    /windowId:\s*string/.test(typesSource),
  "WindowEvent shape"
);

assertCase(
  "d55.api.windowAPI",
  /export interface WindowAPI\b/.test(typesSource) &&
    /create\(/.test(typesSource) &&
    /register\(/.test(typesSource) &&
    /unregister\(/.test(typesSource) &&
    /activate\(/.test(typesSource) &&
    /focus\(/.test(typesSource) &&
    /minimize\(/.test(typesSource) &&
    /restore\(/.test(typesSource) &&
    /close\(/.test(typesSource) &&
    /get\(/.test(typesSource) &&
    /getAll\(/.test(typesSource),
  "WindowAPI exact methods"
);

assertCase(
  "d55.api.registryMethods",
  /createWindowRegistry/.test(registrySource) &&
    /register\(/.test(registrySource) &&
    /unregister\(/.test(registrySource) &&
    /\bhas\(/.test(registrySource) &&
    /\bget\(/.test(registrySource) &&
    /getAll\(/.test(registrySource),
  "WindowRegistry surface"
);

assertCase(
  "d55.api.contextSurface",
  /export function WindowProvider/.test(contextSource) &&
    /export function useWindowContext/.test(contextSource) &&
    /state:\s*WindowState/.test(contextSource) &&
    /api:\s*WindowAPI/.test(contextSource),
  "WindowProvider + useWindowContext"
);

assertCase(
  "d55.api.windowManager",
  /export function WindowManager/.test(managerSource),
  "WindowManager export"
);

const INTERNAL_SYMBOLS = [
  "createEmptyWindowState",
  "WindowContext",
  "DEFAULT_WINDOW_CONTEXT",
  "WindowRegistry",
  "WindowContextValue",
] as const;

const internalLeaks = INTERNAL_SYMBOLS.filter((name) =>
  exported.includes(name)
);

assertCase(
  "d55.api.noInternalBarrelLeak",
  internalLeaks.length === 0,
  internalLeaks.length
    ? `leaked: ${internalLeaks.join(",")}`
    : "no internal symbols in barrel"
);

const failed = results.filter((r) => !r.pass);
const summary = {
  phase: "d55-window-api",
  pass: failed.length === 0,
  total: results.length,
  passed: results.length - failed.length,
  failed: failed.map((f) => f.id),
  results,
};

console.log(JSON.stringify(summary, null, 2));
console.log(
  summary.pass
    ? "\nPASS — d55-window-api"
    : `\nFAIL — d55-window-api (${failed.map((f) => f.id).join(", ")})`
);
process.exit(summary.pass ? 0 : 1);
