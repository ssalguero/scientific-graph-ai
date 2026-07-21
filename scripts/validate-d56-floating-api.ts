/**
 * D56.5 — Floating Windows Foundation API Freeze gate.
 * Authority: D56 Floating Windows API Freeze · D55 WindowAPI intact.
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

const REQUIRED_D55_EXPORTS = [
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

const REQUIRED_D56_STAR_EXPORTS = [
  "./FloatingWindowTypes",
  "./FloatingWindow",
  "./FloatingWindowLayer",
  "./FloatingWindowBridge",
] as const;

const REQUIRED_FILES = [
  "FloatingWindowTypes.ts",
  "FloatingWindow.tsx",
  "FloatingWindowLayer.tsx",
  "FloatingWindowBridge.tsx",
  "index.ts",
] as const;

function collectNamedBarrelExports(source: string): string[] {
  const names = new Set<string>();

  for (const block of source.matchAll(/export\s+type\s*\{([^}]+)\}/g)) {
    for (const part of block[1].split(",")) {
      const name = part.trim().split(/\s+as\s+/)[0]?.trim();
      if (name) names.add(name);
    }
  }

  for (const block of source.matchAll(/export\s*\{([^}]+)\}/g)) {
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

  return Array.from(names);
}

for (const file of REQUIRED_FILES) {
  const full = join(windowsDir, file);
  assertCase(
    `d56.api.file.${file}`,
    existsSync(full),
    existsSync(full) ? "exists" : "missing"
  );
}

const typesSource = read("FloatingWindowTypes.ts");
const windowApiSource = read("WindowTypes.ts");
const barrelSource = read("index.ts");

assertCase(
  "d56.api.floatingWindowModel",
  /export interface FloatingWindowModel\b/.test(typesSource) &&
    /id:\s*string/.test(typesSource) &&
    /title:\s*string/.test(typesSource) &&
    /x:\s*number/.test(typesSource) &&
    /y:\s*number/.test(typesSource) &&
    /width:\s*number/.test(typesSource) &&
    /height:\s*number/.test(typesSource) &&
    /zIndex:\s*number/.test(typesSource) &&
    /visible:\s*boolean/.test(typesSource) &&
    /content\?:\s*ReactNode/.test(typesSource),
  "FloatingWindowModel shape"
);

assertCase(
  "d56.api.floatingWindowProps",
  /export interface FloatingWindowProps\b/.test(typesSource) &&
    /window:\s*FloatingWindowModel/.test(typesSource),
  "FloatingWindowProps shape"
);

assertCase(
  "d56.api.floatingWindowLayerProps",
  /export interface FloatingWindowLayerProps\b/.test(typesSource) &&
    /windows:\s*readonly FloatingWindowModel\[\]/.test(typesSource),
  "FloatingWindowLayerProps shape"
);

assertCase(
  "d56.api.floatingWindowComponent",
  /export function FloatingWindow\b/.test(read("FloatingWindow.tsx")),
  "FloatingWindow export"
);

assertCase(
  "d56.api.floatingWindowLayer",
  /export function FloatingWindowLayer\b/.test(read("FloatingWindowLayer.tsx")),
  "FloatingWindowLayer export"
);

assertCase(
  "d56.api.floatingWindowBridge",
  /export function FloatingWindowBridge\b/.test(read("FloatingWindowBridge.tsx")),
  "FloatingWindowBridge export"
);

const namedExports = collectNamedBarrelExports(barrelSource);
const missingD55 = REQUIRED_D55_EXPORTS.filter((n) => !namedExports.includes(n));

assertCase(
  "d56.api.barrelKeepsD55",
  missingD55.length === 0,
  missingD55.length ? `missing D55: ${missingD55.join(",")}` : "all D55 symbols present"
);

const missingStars = REQUIRED_D56_STAR_EXPORTS.filter((spec) => {
  const escaped = spec.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return !new RegExp(
    `export\\s+\\*\\s+from\\s+["']${escaped}["']`
  ).test(barrelSource);
});

assertCase(
  "d56.api.barrelExportsD56",
  missingStars.length === 0,
  missingStars.length
    ? `missing star exports: ${missingStars.join(",")}`
    : "D56 star exports present"
);

assertCase(
  "d56.api.barrelExists",
  existsSync(barrelPath),
  existsSync(barrelPath) ? "index.ts exists" : "missing index.ts"
);

const forbiddenApiMethods = ["show", "hide", "drag", "resize", "snap", "dock"] as const;
const apiBlockMatch = windowApiSource.match(
  /export interface WindowAPI\s*\{([\s\S]*?)\}/
);
const apiBody = apiBlockMatch?.[1] ?? "";
const forbiddenHits = forbiddenApiMethods.filter((name) =>
  new RegExp(`\\b${name}\\s*\\(`).test(apiBody)
);

assertCase(
  "d56.api.windowApiNoForbiddenMethods",
  forbiddenHits.length === 0,
  forbiddenHits.length
    ? `forbidden methods: ${forbiddenHits.join(",")}`
    : "WindowAPI free of show/hide/drag/resize/snap/dock"
);

assertCase(
  "d56.api.windowApiIntact",
  /create\(/.test(apiBody) &&
    /register\(/.test(apiBody) &&
    /unregister\(/.test(apiBody) &&
    /activate\(/.test(apiBody) &&
    /focus\(/.test(apiBody) &&
    /minimize\(/.test(apiBody) &&
    /restore\(/.test(apiBody) &&
    /close\(/.test(apiBody) &&
    /get\(/.test(apiBody) &&
    /getAll\(/.test(apiBody),
  "WindowAPI D55 methods intact"
);

const failed = results.filter((r) => !r.pass);
const summary = {
  phase: "d56-floating-api",
  pass: failed.length === 0,
  total: results.length,
  passed: results.length - failed.length,
  failed: failed.map((f) => f.id),
  results,
};

console.log(JSON.stringify(summary, null, 2));
console.log(
  summary.pass
    ? "\nPASS — d56-floating-api"
    : `\nFAIL — d56-floating-api (${failed.map((f) => f.id).join(", ")})`
);
process.exit(summary.pass ? 0 : 1);
